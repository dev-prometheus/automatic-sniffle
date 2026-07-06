import { useEffect, useRef, useState } from 'react'
import './QuotePanel.css'

const DISPLAY_TICK = 30
const REFRESH_MS = 10 * 60 * 1000 // 10 min

export default function QuotePanel({
  feeEth,
  feeUsd,
  ethPriceUsd,
  gasEth,
  gasUsd,
  amountOtusdt,
  onRefresh,
  enabled = true
}) {
  const [tick, setTick] = useState(DISPLAY_TICK)
  const refreshRef = useRef(onRefresh)

  useEffect(() => { refreshRef.current = onRefresh }, [onRefresh])

  // Visual countdown, purely cosmetic
  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => (t <= 1 ? DISPLAY_TICK : t - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Actual refresh, only when enabled
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => {
      refreshRef.current?.()
      setTick(DISPLAY_TICK)
    }, REFRESH_MS)
    return () => clearInterval(id)
  }, [enabled])

  const mm = String(Math.floor(tick / 60)).padStart(1, '0')
  const ss = String(tick % 60).padStart(2, '0')
  const totalEth = (feeEth ?? 0) + (gasEth ?? 0)
  const totalUsd = (feeUsd ?? 0) + (gasUsd ?? 0)
  const usd = n => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="quote">
      <div className="quote-row">
        <div className="quote-label">
          <span className="tick">{mm}:{ss}</span>
          Rate
        </div>
        <div className="quote-value">
          {ethPriceUsd
            ? `1 ETH = ${usd(ethPriceUsd)}`
            : '-'}
        </div>
      </div>

      <div className="quote-row">
        <div className="quote-label">Protocol fee</div>
        <div className="quote-value">
          {feeEth !== null ? `${feeEth.toFixed(6)} ETH` : '-'}
          {feeUsd !== null && <span className="sub">{usd(feeUsd)}</span>}
        </div>
      </div>

      <div className="quote-row">
        <div className="quote-label">Network fee</div>
        <div className="quote-value">
          {gasEth !== null ? `${gasEth.toFixed(6)} ETH` : '-'}
          {gasUsd !== null && <span className="sub">{usd(gasUsd)}</span>}
        </div>
      </div>

      <div className="quote-row">
        <div className="quote-label">Est. total</div>
        <div className="quote-value">
          {totalEth ? `${totalEth.toFixed(6)} ETH` : '-'}
          {totalUsd ? <span className="sub">{usd(totalUsd)}</span> : null}
        </div>
      </div>
    </div>
  )
}
