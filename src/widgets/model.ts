import type { Widget } from './types.ts'

export const model: Widget = {
  data({ payload }) {
    const name = payload.model?.display_name?.replace(/\s*\([^)]*\)\s*$/, '')
    if (!name) return null
    return { kind: 'label', text: name, color: 'bold' }
  },
}
