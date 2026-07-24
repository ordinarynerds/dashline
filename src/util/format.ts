export function human(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return `${Math.round(n)}`
}

export function duration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m`
  return `${s}s`
}

export function countdown(resetsAt: number, now: number): string {
  const d = Math.max(0, resetsAt - now)
  const days = Math.floor(d / 86400)
  const hrs = Math.floor((d % 86400) / 3600)
  const mins = Math.floor((d % 3600) / 60)
  if (days > 0) return `${days}d${hrs}h`
  if (hrs > 0) return `${hrs}h${String(mins).padStart(2, '0')}m`
  return `${mins}m`
}
