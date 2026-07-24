import type { Widget } from './types.ts'
import { paint } from '../style.ts'

export const repo: Widget = {
  render({ payload }, opts) {
    const r = payload.workspace?.repo
    if (!r?.name) return null
    const text = opts.variant === 'full' && r.owner ? `${r.owner}/${r.name}` : r.name
    return paint(text, 'dim')
  },
}
