import type { Widget } from './types.ts'

export const session: Widget = {
  data({ payload }) {
    const w = payload.rate_limits?.five_hour
    if (w?.used_percentage == null) return null
    return { kind: 'percent', value: w.used_percentage, scale: 'usage', label: 'session', reset: w.resets_at }
  },
}

export const weekly: Widget = {
  data({ payload }) {
    const w = payload.rate_limits?.seven_day
    if (w?.used_percentage == null) return null
    return { kind: 'percent', value: w.used_percentage, scale: 'usage', label: 'All' }
  },
}
