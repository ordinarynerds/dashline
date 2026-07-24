export function human(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) {
    const k = Math.round(n / 1_000)
    return k >= 1_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${k}k`
  }
  return `${Math.round(n)}`
}

export interface Hms {
  h: number
  m: number
  s: number
}

export function hms(ms: number): Hms {
  const total = Math.floor(ms / 1000)
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 }
}

export function duration(ms: number): string {
  const { h, m, s } = hms(ms)
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
