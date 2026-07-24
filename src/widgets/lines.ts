import type { Widget } from './types.ts'
import { paint } from '../style.ts'

export const lines: Widget = {
  render({ payload }) {
    const added = payload.cost?.total_lines_added
    const removed = payload.cost?.total_lines_removed
    if (added == null && removed == null) return null
    return `${paint(`+${added ?? 0}`, 'green')} ${paint(`-${removed ?? 0}`, 'red')}`
  },
}
