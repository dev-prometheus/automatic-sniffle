import { useEffect, useState } from 'react'
import { formatEther } from 'ethers'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect } from '@reown/appkit/react'
import { supabase, updateStatus } from '../lib/supabase'
import { getOtusdtBalance, getRecoveryContract } from '../lib/contract'
import { getEthPriceUsd, estimateNetworkFeeWei, getRecoveryFromChain, getRecoveryState, fetchLatestRecoveryEvent } from '../lib/price'
import { useCountdown } from '../lib/useCountdown'
import Nav from '../components/landing/Nav'
import Logomark from '../components/landing/Logomark'
import ConfirmModal from '../components/ConfirmModal'
import QuotePanel from '../components/QuotePanel'
import './Recovery.css'
import './Success.css'

export default function Recovery() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [entry, setEntry] = useState(location.state?.entry || null)
  const [loading, setLoading] = useState(!entry)
  const [showModal, setShowModal] = useState(false)
  const [otusdtBalance, setOtusdtBalance] = useState(null)
  const [feeEth, setFeeEth] = useState(null)
  const [feeUsd, setFeeUsd] = useState(null)
  const [gasEth, setGasEth] = useState(null)
  const [gasUsd, setGasUsd] = useState(null)
  const [ethPriceUsd, setEthPriceUsd] = useState(null)
  const [quoteNonce, setQuoteNonce] = useState(0)
  const [chainAmount, setChainAmount] = useState(null)
  const [txReceipt, setTxReceipt] = useState(null)

  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const { disconnect } = useDisconnect()

  const countdown = useCountdown(entry?.countdown_end)
  const mockRecovered = new URLSearchParams(location.search).get('mock') === 'recovered'
  const isRecovered = mockRecovered || entry?.status === 'recovered'

  useEffect(() => {
    if (entry) return
    async function load() {
      const { data } = await supabase.from('entries').select('*').eq('id', id).maybeSingle()
      if (!data) navigate('/')
      else setEntry(data)
      setLoading(false)
    }
    load()
  }, [id, entry, navigate])

  useEffect(() => {
    if (!isConnected || !walletProvider || !address || !isRecovered) return
    getOtusdtBalance(walletProvider, address).then(setOtusdtBalance).catch(() => {})
  }, [isConnected, walletProvider, address, isRecovered])

  // On-chain truth check: if contract says Recovered but Supabase says pending,
  // trust the chain and sync Supabase in the background. Also fetches the
  // RecoveryClaimed event so the success view shows real tx data on reload.
  useEffect(() => {
    if (!entry || entry.status === 'recovered' || mockRecovered) return
    let cancelled = false
    ;(async () => {
      try {
        const state = await getRecoveryState(entry.wallet_address)
        if (cancelled) return
        if (state.status !== 2) return

        setChainAmount(Number(state.amount) / 1e6)
        setEntry(prev => prev ? { ...prev, status: 'recovered' } : prev)
        updateStatus(entry.id, 'recovered').catch(() => {})

        // Look up the on-chain event so success view has hash + block + fee
        try {
          const evt = await fetchLatestRecoveryEvent(entry.wallet_address)
          if (cancelled || !evt) return
          const feeEth = Number(formatEther(evt.feeWei))
          let feeUsd = null
          try {
            const px = await getEthPriceUsd()
            feeUsd = feeEth * px
          } catch {}
          setTxReceipt(prev => prev || {
            hash: evt.hash,
            blockNumber: evt.blockNumber,
            gasUsed: null,
            feeEth,
            feeUsd
          })
        } catch {}
      } catch {}
    })()
    return () => { cancelled = true }
  }, [entry?.id, entry?.wallet_address, entry?.status, mockRecovered])

  useEffect(() => {
    if (!entry || isRecovered) return
    let cancelled = false

    ;(async () => {
      let price = null
      try {
        price = await getEthPriceUsd()
        if (!cancelled) setEthPriceUsd(price)
      } catch {}

      if (!isConnected || !walletProvider || !address) {
        try {
          const chain = await getRecoveryFromChain(entry.wallet_address)
          if (chain.hasRecovery && price && !cancelled) {
            const eth = Number(chain.feeWei) / 1e18
            setFeeEth(eth)
            setFeeUsd(eth * price)
            setChainAmount(Number(chain.amount) / 1e6)
          } else if (price && !cancelled) {
            const usd = Number(entry.amount) * 0.15
            setFeeUsd(usd)
            setFeeEth(usd / price)
            setChainAmount(null)
          }
        } catch {
          if (price && !cancelled) {
            const usd = Number(entry.amount) * 0.15
            setFeeUsd(usd)
            setFeeEth(usd / price)
            setChainAmount(null)
          }
        }
        try {
          const gasWei = await estimateNetworkFeeWei()
          const gEth = Number(gasWei) / 1e18
          if (cancelled) return
          setGasEth(gEth)
          if (price) setGasUsd(gEth * price)
        } catch {}
        return
      }

      try {
        const c = await getRecoveryContract(walletProvider, false)
        const [rec, feeWei, priceRaw] = await Promise.all([
          c.recoveries(entry.wallet_address),
          c.quoteFeeWei(entry.wallet_address),
          c.getEthPriceUsd()
        ])
        const p = Number(priceRaw) / 1e8
        const eth = Number(feeWei) / 1e18
        if (cancelled) return
        setEthPriceUsd(p)
        setFeeEth(eth)
        setFeeUsd(eth * p)
        if (Number(rec.status) === 1) {
          setChainAmount(Number(rec.amount) / 1e6)
        } else {
          setChainAmount(null)
        }
      } catch {
        if (price && !cancelled) {
          const usd = Number(entry.amount) * 0.15
          setFeeUsd(usd)
          setFeeEth(usd / price)
        }
      }

      // Gas estimate
      if (!walletProvider) return
      try {
        const c = await getRecoveryContract(walletProvider, true)
        const provider = c.runner.provider
        const [feeWei, feeData] = await Promise.all([
          c.quoteFeeWei(entry.wallet_address).catch(() => 0n),
          provider.getFeeData()
        ])
        const gasLimit = feeWei > 0n
          ? await c.claimRecovery.estimateGas({ value: feeWei }).catch(() => 200000n)
          : 200000n
        const gasPrice = feeData.maxFeePerGas || feeData.gasPrice || 30000000000n
        const gasWei = gasLimit * gasPrice
        const gEth = Number(gasWei) / 1e18
        if (cancelled) return
        setGasEth(gEth)
        if (price || ethPriceUsd) setGasUsd(gEth * (price || ethPriceUsd))
      } catch {}
    })()

    return () => { cancelled = true }
  }, [entry, isRecovered, isConnected, walletProvider, address, quoteNonce])

  const walletMismatch = isConnected && address && entry &&
    address.toLowerCase() !== entry.wallet_address.toLowerCase()

  async function onConfirmed(receipt) {
    setTxReceipt(receipt)
    // Retry balance up to 3 times (2s apart) to catch propagation
    if (walletProvider && address) {
      const before = otusdtBalance !== null ? Number(otusdtBalance) : 0
      for (let i = 0; i < 3; i++) {
        try {
          const bal = await getOtusdtBalance(walletProvider, address)
          if (Number(bal) > before) {
            setOtusdtBalance(bal)
            break
          }
        } catch {}
        await new Promise(r => setTimeout(r, 2000))
      }
    }
    await updateStatus(entry.id, 'recovered')
    const { data } = await supabase.from('entries').select('*').eq('id', entry.id).maybeSingle()
    setEntry(data)
    setShowModal(false)
  }

  if (loading || !entry) return (
    <>
      <Nav />
      <div className="recovery"><div className="recovery-inner">Loading...</div></div>
    </>
  )

  return (
    <>
    <Nav />
    <section className="recovery">
      <div className="recovery-bg" aria-hidden />
      <div className="recovery-inner">
        <div className="rec-header">
          <button className="rec-back" onClick={() => navigate('/')}>← Back to protocol</button>
          <span className={`rec-status ${isRecovered ? 'recovered' : 'pending'}`}>
            {isRecovered ? 'Recovered' : 'Pending approval'}
          </span>
        </div>

        {isRecovered ? (
          <RecoveredView entry={entry} otusdtBalance={otusdtBalance} chainAmount={chainAmount} receipt={txReceipt} walletProvider={walletProvider} address={address} setOtusdtBalance={setOtusdtBalance} />
        ) : (
          <div className="rec-grid">
            <aside className="rec-side">
              <div className="rec-side-block">
                <div className="rec-side-label">Recipient</div>
                <div className="rec-side-value">{entry.name}</div>
                <div className="rec-side-sub mono">{entry.file_number}</div>
              </div>

              <div className="rec-side-block">
                <div className="rec-side-label">Destination wallet</div>
                <div className="rec-side-value mono small">{entry.wallet_address.slice(0, 8)}...{entry.wallet_address.slice(-6)}</div>
              </div>

              <div className="rec-side-block">
                <div className="rec-side-label">Window closes in</div>
                {countdown.expired ? (
                  <div className="countdown-expired">Window closed</div>
                ) : (
                  <div className="rec-side-count">
                    <span><b>{String(countdown.days).padStart(2,'0')}</b><i>d</i></span>
                    <span><b>{String(countdown.hours).padStart(2,'0')}</b><i>h</i></span>
                    <span><b>{String(countdown.minutes).padStart(2,'0')}</b><i>m</i></span>
                    <span><b>{String(countdown.seconds).padStart(2,'0')}</b><i>s</i></span>
                  </div>
                )}
              </div>
            </aside>

            <main className="rec-main">
              <div className="rec-hero">
                <div className="rec-hero-label">You will receive</div>
                <div className="rec-hero-amount">
                  {Number(chainAmount ?? entry.amount).toLocaleString()}
                  <span className="rec-hero-tick">USDT</span>
                </div>
                <div className="rec-hero-usd">
                  ${Number(chainAmount ?? entry.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <QuotePanel
                feeEth={feeEth}
                feeUsd={feeUsd}
                ethPriceUsd={ethPriceUsd}
                gasEth={gasEth}
                gasUsd={gasUsd}
                amountOtusdt={chainAmount ?? entry.amount}
                onRefresh={() => setQuoteNonce(n => n + 1)}
                enabled={isConnected && !walletMismatch && !showModal}
              />

              <div className="actions">
                {!isConnected ? (
                  <button className="btn-primary" onClick={() => open()}>Connect wallet to continue</button>
                ) : (
                  <>
                    <button className="btn-secondary" onClick={() => open()}>
                      Connected {address.slice(0, 6)}...{address.slice(-4)}
                    </button>
                    {walletMismatch ? (
                      <div className="mismatch">
                        <div className="mismatch-title">Wrong wallet connected</div>
                        <div className="mismatch-body">
                          This recovery record is tied to a different wallet. Please disconnect and reconnect with the correct wallet to proceed.
                        </div>
                        <div className="mismatch-meta">
                          <div>
                            <span>Connected</span>
                            <span className="mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                          </div>
                          <div>
                            <span>Expected</span>
                            <span className="mono">{entry.wallet_address.slice(0, 6)}...{entry.wallet_address.slice(-4)}</span>
                          </div>
                        </div>
                        <button className="btn-primary" onClick={() => disconnect()}>
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => setShowModal(true)}
                        disabled={countdown.expired}
                      >
                        Approve recovery
                      </button>
                    )}
                  </>
                )}
              </div>
            </main>
          </div>
        )}

        {showModal && isConnected && (
          <ConfirmModal
            entry={entry}
            walletProvider={walletProvider}
            address={address}
            onClose={() => setShowModal(false)}
            onConfirm={onConfirmed}
          />
        )}
      </div>
    </section>
    </>
  )
}


function RecoveredView({ entry, otusdtBalance, chainAmount, receipt, walletProvider, address, setOtusdtBalance }) {
  const gatewayUrl = import.meta.env.VITE_GATEWAY_URL
  const amount = Number(chainAmount ?? entry.amount)
  const balance = otusdtBalance !== null ? Number(otusdtBalance) : null
  const hash = receipt?.hash
  const shortHash = hash ? `${hash.slice(0, 14)}...${hash.slice(-10)}` : null
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [confirmedAt] = useState(() => Date.now())
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!receipt) return
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [receipt])

  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const serial = `RCV-${y}-${m}-${d}-${(entry.id || '0000').replace(/-/g, '').slice(-4).toUpperCase()}`
  const dateStr = now.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  }) + ' UTC'

  const elapsed = receipt ? Math.floor((Date.now() - confirmedAt) / 1000) : 0
  const elapsedLabel = elapsed < 60 ? `${elapsed}s ago` : `${Math.floor(elapsed/60)}m ago`

  async function copyHash() {
    if (!hash) return
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {}
  }

  async function refreshBalance() {
    if (!walletProvider || !address) return
    setRefreshing(true)
    try {
      const bal = await getOtusdtBalance(walletProvider, address)
      setOtusdtBalance(bal)
    } catch {}
    setRefreshing(false)
  }

  return (
    <div className="stmt">
      <div className="stmt-head">
        <div className="stmt-eyebrow">
          <span className="stmt-check">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          Recovery statement
        </div>
        <div className="stmt-serial">
          <span className="stmt-serial-label">Serial</span>
          <span className="stmt-serial-num">{serial}</span>
        </div>
      </div>

      <div className="stmt-hero">
        <div className="stmt-watermark" aria-hidden>
          <Logomark size={180} />
        </div>
        <div className="stmt-hero-label">Recovered amount</div>
        <div className="stmt-hero-num">
          {amount.toLocaleString()}<em>USDT</em>
        </div>
        <div className="stmt-hero-usd">≈ ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className="stmt-hero-date">{dateStr}</div>
      </div>

      <div className="stmt-section">
        <div className="stmt-section-head">
          <div className="stmt-section-label">Transaction</div>
          <div className="stmt-net">Ethereum mainnet</div>
        </div>

        {hash && (
          <div className="stmt-hash">
            <span className="stmt-hash-text">{shortHash}</span>
            <button className="stmt-hash-btn" onClick={copyHash}>{copied ? 'Copied' : 'Copy'}</button>
            <a
              className="stmt-hash-btn link"
              href={`https://etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
            >
              Etherscan
            </a>
          </div>
        )}

        {receipt?.blockNumber && (
          <div className="stmt-confirm">
            <span className="stmt-confirm-dot" />
            Confirmed at block <b>#{receipt.blockNumber.toLocaleString()}</b>
            <span className="stmt-confirm-sep">·</span>
            {elapsedLabel}
          </div>
        )}

        <div className="stmt-grid">
          {receipt?.feeEth !== null && receipt?.feeEth !== undefined && (
            <div>
              <div className="stmt-cell-label">Fee paid</div>
              <div className="stmt-cell-value">{receipt.feeEth.toFixed(6)} ETH</div>
              {receipt.feeUsd !== null && (
                <div className="stmt-cell-sub">${receipt.feeUsd.toFixed(2)}</div>
              )}
            </div>
          )}
          <div>
            <div className="stmt-cell-label">Recipient</div>
            <div className="stmt-cell-value">{entry.wallet_address.slice(0, 8)}...{entry.wallet_address.slice(-6)}</div>
          </div>
          <div>
            <div className="stmt-cell-label">File ref</div>
            <div className="stmt-cell-value">{entry.file_number}</div>
          </div>
        </div>
      </div>

      <div className="stmt-wallet">
        <div className="stmt-wallet-left">
          <div className="stmt-cell-label">Wallet balance</div>
          <div className="stmt-balance">
            {balance !== null ? balance.toLocaleString() : '-'}
            <em>USDT · ${balance !== null ? balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</em>
          </div>
        </div>
        <button className="stmt-refresh" onClick={refreshBalance} disabled={refreshing}>
          {refreshing ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      <div className="stmt-actions">
        <a href="#" className="stmt-action primary">
          Open USDT Gateway
        </a>
        {hash && (
          <a
            href={`https://etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="stmt-action secondary"
          >
            View transaction on Etherscan
          </a>
        )}
      </div>
    </div>
  )
}
