import type { Widget } from './types.ts'

export const name: Widget = {
  data({ payload }, opts) {
    const n = payload.session_name
    if (!n) return null
    const text = opts.id && payload.session_id ? `${n}-${payload.session_id.slice(0, 8)}` : n
    return { kind: 'label', text, color: 'dim' }
  },
}
