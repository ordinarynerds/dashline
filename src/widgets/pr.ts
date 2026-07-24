import type { Widget } from './types.ts'

export const pr: Widget = {
  data({ payload }) {
    const n = payload.pr?.number
    if (n == null) return null
    return { kind: 'label', text: `PR #${n}`, color: 'magenta' }
  },
}
