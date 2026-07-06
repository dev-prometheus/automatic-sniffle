import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatEther } from 'ethers'
import { getEthBalance, getRecoveryContract } from '../lib/contract'
import './Modal.css'

const usd = n => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function ConfirmModal({ entry, walletProvider, address, onClose, onConfirm }) {
  const [feeWei, setFeeWei] = useState(null)
  const [chainAmount, setChainAmount] = useState(null)
  const [ethPriceUsd, setEthPriceUsd] = useState(null)
  const [balanceWei, setBalanceWei] = useState(null)
  const [gasEstimateWei, setGasEstimateWei] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const readC = await getRecoveryContract(walletProvider, false)
        const writeC = await getRecoveryContract(walletProvider, true)

        const [rec, fee, price, bal] = await Promise.all([
          readC.recoveries(address),
          readC.quoteFeeWei(address),
          readC.getEthPriceUsd(),
          getEthBalance(walletProvider, address)
        ])

        let gas = 0n
        try {
          const est = await writeC.claimRecovery.estimateGas({ value: fee })
          const gasPrice = (await writeC.runner.provider.getFeeData()).maxFeePerGas || 0n
          gas = est * gasPrice
        } catch {
          gas = 200000n * 30000000000n
        }

        if (cancelled) return
        setChainAmount(Number(rec.amount) / 1e6)
        setFeeWei(fee)
        setEthPriceUsd(Number(price) / 1e8)
        setBalanceWei(bal.wei)
        setGasEstimateWei(gas)
      } catch (err) {
        if (!cancelled) setError(err.shortMessage || err.message || 'Failed to load recovery details.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    // Refresh quote every 30s while modal is open, but not during submission
    const id = setInterval(() => { if (!submitting) load() }, 30000)
    return () => { cancelled = true; clearInterval(id) }
  }, [walletProvider, address, submitting])

  const totalNeeded = feeWei !== null && gasEstimateWei !== null ? feeWei + gasEstimateWei : null
  const enough = totalNeeded !== null && balanceWei !== null && balanceWei >= totalNeeded
  const feeEth = feeWei !== null ? Number(formatEther(feeWei)) : null
  const feeUsd = feeEth !== null && ethPriceUsd ? feeEth * ethPriceUsd : null
  const gasEth = gasEstimateWei !== null ? Number(formatEther(gasEstimateWei)) : null
  const gasUsd = gasEth !== null && ethPriceUsd ? gasEth * ethPriceUsd : null
  const totalEth = totalNeeded !== null ? Number(formatEther(totalNeeded)) : null
  const totalUsd = totalEth !== null && ethPriceUsd ? totalEth * ethPriceUsd : null
  const balanceEth = balanceWei !== null ? Number(formatEther(balanceWei)) : null

  const shortfallWei = totalNeeded && balanceWei && !enough ? totalNeeded - balanceWei : 0n
  const shortfallEth = shortfallWei > 0n ? Number(formatEther(shortfallWei)) : 0
  const shortfallUsd = shortfallEth * (ethPriceUsd || 0)

  async function submit() {
    setError('')
    setSubmitting(true)
    try {
      const c = await getRecoveryContract(walletProvider, true)
      const tx = await c.claimRecovery({ value: feeWei })
      const receipt = await tx.wait()
      onConfirm({
        hash: tx.hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString?.() ?? null,
        feeEth: feeWei ? Number(formatEther(feeWei)) : null,
        feeUsd: feeWei && ethPriceUsd ? Number(formatEther(feeWei)) * ethPriceUsd : null
      })
    } catch (err) {
      setError(err.shortMessage || err.message || 'Transaction failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal((
    <div className="modal-backdrop" onClick={submitting ? undefined : onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">Confirm recovery</div>
          <button className="modal-close" onClick={onClose} disabled={submitting} aria-label="Close">×</button>
        </div>

        {loading && <div className="modal-loading">Fetching quote...</div>}

        <div className="modal-body">

        {!loading && !error && (
          <>
            <div className="modal-hero">
              <div className="modal-hero-label">You receive</div>
              <div className="modal-hero-amount">
                {Number(chainAmount).toLocaleString()}
                <span className="modal-hero-tick">OTUSDT</span>
              </div>
              <div className="modal-hero-usd">{usd(Number(chainAmount))}</div>
            </div>

            <div className="modal-rows">
              <div className="modal-row">
                <span className="modal-label">Protocol fee</span>
                <span className="modal-value">
                  {feeEth?.toFixed(6)} ETH
                  {feeUsd !== null && <span className="modal-sub">{usd(feeUsd)}</span>}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Network fee</span>
                <span className="modal-value">
                  {gasEth?.toFixed(6)} ETH
                  {gasUsd !== null && <span className="modal-sub">{usd(gasUsd)}</span>}
                </span>
              </div>
              <div className="modal-row">
                <span className="modal-label">Your ETH balance</span>
                <span className="modal-value">
                  {balanceEth?.toFixed(6)} ETH
                  {ethPriceUsd && <span className="modal-sub">{usd(balanceEth * ethPriceUsd)}</span>}
                </span>
              </div>
              <div className="modal-row total">
                <span className="modal-label">Est. total</span>
                <span className="modal-value">
                  {totalEth?.toFixed(6)} ETH
                  {totalUsd !== null && <span className="modal-sub">{usd(totalUsd)}</span>}
                </span>
              </div>
            </div>

            {!enough && (
              <div className="modal-warning">
                <strong>Insufficient ETH to complete recovery</strong>
                Top up your wallet to proceed.
                <div className="topup">
                  Need: {shortfallEth.toFixed(6)} ETH ({usd(shortfallUsd)})
                </div>
              </div>
            )}
          </>
        )}

        {error && <div className="modal-warning"><strong>Error</strong>{error}</div>}

        </div>

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="modal-confirm"
            onClick={submit}
            disabled={loading || !enough || submitting}
          >
            {submitting ? 'Confirming...' : 'Confirm recovery'}
          </button>
        </div>
      </div>
    </div>
  ), document.body)
}
