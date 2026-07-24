import type { Widget } from './types.ts'
import { paint } from '../style.ts'

export const pr: Widget = {
  render({ payload }) {
    const n = payload.pr?.number
    if (n == null) return null
    return paint(`PR #${n}`, 'magenta')
  },
}
