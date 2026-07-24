import type { Widget } from './types.ts'
import { paint } from '../style.ts'

export const effort: Widget = {
  render({ payload }) {
    const level = payload.effort?.level
    if (!level) return null
    return paint(level, 'dim')
  },
}
