import type { Widget } from './types.ts'
import { paint } from '../style.ts'

export const name: Widget = {
  render({ payload }) {
    const n = payload.session_name
    if (!n) return null
    return paint(n, 'dim')
  },
}
