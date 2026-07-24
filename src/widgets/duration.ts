import type { Widget } from './types.ts'
import { paint } from '../style.ts'
import { duration as fmt } from '../util/format.ts'

export const duration: Widget = {
  render({ payload }) {
    const ms = payload.cost?.total_duration_ms
    if (ms == null) return null
    return paint(fmt(ms), 'dim')
  },
}
