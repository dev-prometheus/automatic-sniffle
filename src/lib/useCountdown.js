import { useEffect, useState } from 'react'

export function useCountdown(endIso) {
  const [remaining, setRemaining] = useState(() => diff(endIso))

  useEffect(() => {
    const id = setInterval(() => setRemaining(diff(endIso)), 1000)
    return () => clearInterval(id)
  }, [endIso])

  return remaining
}

function diff(endIso) {
  if (!endIso) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  const ms = new Date(endIso).getTime() - Date.now()
  if (ms <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  const total = Math.floor(ms / 1000)
  return {
    total,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    expired: false
  }
}
