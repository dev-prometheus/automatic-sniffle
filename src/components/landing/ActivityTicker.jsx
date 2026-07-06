import { useEffect, useState } from 'react'
import { getRecentRecoveries } from '../../lib/activity'
import './ActivityTicker.css'

function fmtUsd(n) {
  const opts = n % 1 === 0
    ? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  return '$' + n.toLocaleString(undefined, opts)
}

export default function ActivityTicker() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    let live = true
    getRecentRecoveries(14).then(r => { if (live) setRows(r) })
    return () => { live = false }
  }, [])

  if (!rows.length) return null

  return (
    <section className="ticker" id="activity">
      <div className="ticker-inner">
        <div className="ticker-head">
          <div>
            <div className="ticker-eyebrow">
              <span className="ticker-pulse" />
              Live feed
            </div>
            <h2 className="ticker-title">Recent recoveries</h2>
          </div>
          <div className="ticker-meta">Last 14 claims</div>
        </div>

        <div className="ticker-list">
          <div className="ticker-headers">
            <div className="ticker-cell ticker-head-cell">Wallet</div>
            <div className="ticker-cell ticker-head-cell ticker-head-amount">Amount</div>
            <div className="ticker-cell ticker-head-cell ticker-head-time">When</div>
          </div>
          {rows.map(r => (
            <div key={r.id} className="ticker-row">
              <div className="ticker-cell ticker-who">
                <div className="ticker-avatar">{r.name.charAt(0)}</div>
                <div>
                  <div className="ticker-name">{r.name}</div>
                  <div className="ticker-wallet mono">{r.wallet.slice(0, 6)}...{r.wallet.slice(-4)}</div>
                </div>
              </div>
              <div className="ticker-cell ticker-amount">
                <div className="ticker-value">{fmtUsd(r.amount)}</div>
                <div className="ticker-sub">{r.amount.toLocaleString()} OTUSDT</div>
              </div>
              <div className="ticker-cell ticker-time">
                {r.real && <span className="ticker-verified" title="Verified on-chain">•</span>}
                <span>{r.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
