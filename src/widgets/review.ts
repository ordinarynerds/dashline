import type { Widget } from './types.ts'
import { paint } from '../style.ts'

const COLORS: Record<string, string> = {
  approved: 'green',
  pending: 'yellow',
  changes_requested: 'red',
  draft: 'dim',
}

export const review: Widget = {
  render({ payload }) {
    const state = payload.pr?.review_state
    if (!state) return null
    return paint(state.replace(/_/g, ' '), COLORS[state] ?? 'dim')
  },
}
