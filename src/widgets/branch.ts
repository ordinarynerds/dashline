import type { Widget } from './types.ts'

export const branch: Widget = {
  data({ git }) {
    if (!git.branch) return null
    return { kind: 'label', text: git.branch, icon: '⎇', color: 'cyan' }
  },
}
