import type { Widget } from './types.ts'

const COLORS: Record<string, string> = {
  approved: 'green',
  pending: 'yellow',
  changes_requested: 'red',
  draft: 'dim',
}

export const review: Widget = {
  data({ payload }) {
    const state = payload.pr?.review_state
    if (!state) return null
    return { kind: 'label', text: state.replace(/_/g, ' '), color: COLORS[state] ?? 'dim' }
  },
}
