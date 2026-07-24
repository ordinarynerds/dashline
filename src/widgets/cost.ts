import type { Widget } from './types.ts'

export const cost: Widget = {
  data({ payload }) {
    const usd = payload.cost?.total_cost_usd
    if (usd == null) return null
    return { kind: 'money', usd }
  },
}
