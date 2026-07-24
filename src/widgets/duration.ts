import type { Widget } from './types.ts'

export const duration: Widget = {
  data({ payload }) {
    const ms = payload.cost?.total_duration_ms
    if (ms == null) return null
    return { kind: 'duration', ms }
  },
}
