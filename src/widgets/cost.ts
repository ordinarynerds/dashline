import type { Widget } from './types.ts'
import { paint } from '../style.ts'

export const cost: Widget = {
  render({ payload }) {
    const usd = payload.cost?.total_cost_usd
    if (usd == null) return null
    return paint(`$${usd.toFixed(2)}`, 'green')
  },
}
