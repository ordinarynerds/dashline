import type { Widget } from './types.ts'

export const name: Widget = {
  data({ payload }, opts) {
    // The bare session id, for anyone who wants it without the generated name.
    if (opts.variant === 'id') {
      const sid = payload.session_id
      return sid ? { kind: 'label', text: sid.slice(0, 8), color: 'dim' } : null
    }
    const n = payload.session_name
    if (!n) return null
    const text = opts.id && payload.session_id ? `${n}-${payload.session_id.slice(0, 8)}` : n
    return { kind: 'label', text, color: 'dim' }
  },
}
