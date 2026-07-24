import type { Widget } from './types.ts'

export const effort: Widget = {
  data({ payload }) {
    const level = payload.effort?.level
    if (!level) return null
    return { kind: 'label', text: level, color: 'dim' }
  },
}
