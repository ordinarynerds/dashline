import type { Widget } from './types.ts'
import { paint } from '../style.ts'

export const output: Widget = {
  render({ payload }) {
    const s = payload.output_style?.name
    if (!s) return null
    return paint(`/${s}`, 'dim')
  },
}
