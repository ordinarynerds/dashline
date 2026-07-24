import type { Widget } from './types.ts'

export const version: Widget = {
  data({ payload }) {
    if (!payload.version) return null
    return { kind: 'label', text: `v${payload.version}`, color: 'dim' }
  },
}
