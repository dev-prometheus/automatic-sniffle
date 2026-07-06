import seed from '../data/recoveries.seed.json'
import { supabase } from './supabase'

// Deterministic PRNG seeded by day
function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(arr, rng) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function timeAgo(hours) {
  if (hours < 1) return 'just now'
  if (hours < 24) return `${Math.floor(hours)}h ago`
  const d = Math.floor(hours / 24)
  return `${d}d ago`
}

function timeAgoFromDate(iso) {
  const ms = Date.now() - new Date(iso).getTime()
  return timeAgo(ms / 3600000)
}

export async function getRecentRecoveries(limit = 12) {
  // Real recoveries from Supabase (already-recovered rows)
  let real = []
  try {
    const { data } = await supabase
      .from('entries')
      .select('id, name, amount, wallet_address, created_at')
      .eq('status', 'recovered')
      .order('created_at', { ascending: false })
      .limit(limit)
    real = (data || []).map(r => ({
      id: `r-${r.id}`,
      name: r.name,
      amount: Number(r.amount),
      wallet: r.wallet_address,
      label: timeAgoFromDate(r.created_at),
      ts: new Date(r.created_at).getTime(),
      real: true
    }))
  } catch {}

  // Daily-seeded shuffle for seed subset
  const daySeed = Math.floor(Date.now() / 86400000)
  const rng = mulberry32(daySeed)
  const shuffled = shuffle(seed, rng)
  const subset = shuffled.slice(0, Math.max(limit - real.length, 6)).map(s => ({
    id: s.id,
    name: s.name,
    amount: s.amount,
    wallet: s.wallet,
    label: timeAgo(s.hours_ago),
    ts: Date.now() - s.hours_ago * 3600000,
    real: false
  }))

  const merged = [...real, ...subset]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)

  return merged
}
