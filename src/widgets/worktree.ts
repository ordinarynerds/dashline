import type { Widget } from './types.ts'
import { paint } from '../style.ts'

export const worktree: Widget = {
  render({ git }) {
    if (!git.worktree) return null
    return `${paint('⌂', 'yellow')} ${paint(git.worktree, 'yellow')}`
  },
}
