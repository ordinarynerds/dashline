import type { Widget } from './types.ts'

export const output: Widget = {
  data({ payload }) {
    const s = payload.output_style?.name
    if (!s) return null
    return { kind: 'label', text: `/${s}`, color: 'dim' }
  },
}
