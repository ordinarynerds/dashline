import type { Widget } from './types.ts'
import { paint } from '../style.ts'

export const model: Widget = {
  render({ payload }) {
    const name = payload.model?.display_name?.replace(/\s*\([^)]*\)\s*$/, '')
    if (!name) return null
    return paint(name, 'bold')
  },
}
