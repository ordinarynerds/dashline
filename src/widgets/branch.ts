import type { Widget } from './types.ts'

export const branch: Widget = {
  needs: { branch: true },
  data({ git }) {
    if (!git.branch) return null
    return { kind: 'label', text: git.branch, icon: '⎇', color: 'cyan' }
  },
}
