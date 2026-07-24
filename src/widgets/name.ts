import type { Widget } from './types.ts'

export const name: Widget = {
  data({ payload }) {
    const n = payload.session_name
    if (!n) return null
    return { kind: 'label', text: n, color: 'dim' }
  },
}
