import type { Widget } from './types.ts'

export const worktree: Widget = {
  data({ git }) {
    if (!git.worktree) return null
    return { kind: 'label', text: git.worktree, icon: '⌂', iconColor: 'yellow', color: 'yellow' }
  },
}
