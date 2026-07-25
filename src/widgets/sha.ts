import type { Widget } from './types.ts'

export const sha: Widget = {
  needs: { sha: true },
  data({ git }) {
    if (!git.sha) return null
    return { kind: 'label', text: git.sha, color: 'dim' }
  },
}
