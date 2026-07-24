import type { Widget } from './types.ts'
import { paint } from '../style.ts'

export const version: Widget = {
  render({ payload }) {
    if (!payload.version) return null
    return paint(`v${payload.version}`, 'dim')
  },
}
