import { useEffect, useMemo, useState } from 'react'
import { getRecentRecoveries } from '../../lib/activity'
import './StatsRail.css'

function fmtCompact(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

export default function StatsRail() {
  const [rows, setRows] = useState([])
  useEffect(() => {
    let live = true
    getRecentRecoveries(30).then(r => { if (live) setRows(r) })
    return () => { live = false }
  }, [])

  const stats = useMemo(() => {
    const total = rows.reduce((a, r) => a + r.amount, 0)
    const count = rows.length
    const avg = count ? total / count : 0
    const largest = rows.reduce((a, r) => Math.max(a, r.amount), 0)
    return { total, count, avg, largest }
  }, [rows])

  if (!rows.length) return null

  const items = [
    { k: 'Total recovered', v: fmtCompact(stats.total) },
    { k: 'Wallets restored', v: stats.count.toLocaleString() },
    { k: 'Average claim', v: fmtCompact(stats.avg) },
    { k: 'Largest recovery', v: fmtCompact(stats.largest) }
  ]

  const doubled = [...items, ...items, ...items]

  return (
    <div className="rail">
      <div className="rail-track">
        {doubled.map((it, i) => (
          <div className="rail-item" key={i}>
            <span className="rail-k">{it.k}</span>
            <span className="rail-v">{it.v}</span>
            <span className="rail-sep">/</span>
          </div>
        ))}
      </div>
    </div>
  )
}
