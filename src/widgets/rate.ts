import type { Widget } from './types.ts'

// Under a minute of wall clock the rate swings wildly and means nothing.
const MIN_MS = 60_000

// Spend per hour, from the cost and duration already in the payload. `cost` says what the
// session has spent; this says how fast, which is the number you act on.
export const rate: Widget = {
  data({ payload }) {
    const usd = payload.cost?.total_cost_usd
    const ms = payload.cost?.total_duration_ms
    if (usd == null || ms == null || ms < MIN_MS) return null
    return { kind: 'money', usd: usd / (ms / 3_600_000), suffix: '/h' }
  },
}
