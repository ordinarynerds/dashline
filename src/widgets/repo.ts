import type { Widget } from './types.ts'

export const repo: Widget = {
  data({ payload }, opts) {
    const r = payload.workspace?.repo
    if (!r) return null
    if (opts.variant === 'owner') return r.owner ? { kind: 'label', text: r.owner, color: 'dim' } : null
    if (opts.variant === 'host') return r.host ? { kind: 'label', text: r.host, color: 'dim' } : null
    if (!r.name) return null
    const text = opts.variant === 'full' && r.owner ? `${r.owner}/${r.name}` : r.name
    return { kind: 'label', text, color: 'dim' }
  },
}
