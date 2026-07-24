import type { Widget } from './types.ts'

export const repo: Widget = {
  data({ payload }, opts) {
    const r = payload.workspace?.repo
    if (!r?.name) return null
    const text = opts.variant === 'full' && r.owner ? `${r.owner}/${r.name}` : r.name
    return { kind: 'label', text, color: 'dim' }
  },
}
