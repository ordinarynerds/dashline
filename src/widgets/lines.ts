import type { Widget } from './types.ts'

export const lines: Widget = {
  data({ payload }) {
    const added = payload.cost?.total_lines_added
    const removed = payload.cost?.total_lines_removed
    if (added == null && removed == null) return null
    return { kind: 'delta', added: added ?? 0, removed: removed ?? 0 }
  },
}
