import type { Widget } from './types.ts'

// Working-tree churn against HEAD, staged and unstaged together. Distinct from `lines`,
// which counts what this session wrote and comes from the payload. A clean tree shows
// nothing rather than "+0 -0"; reporting clean is `dirty`'s job.
export const diff: Widget = {
  needs: { diff: true },
  data({ git }) {
    const added = git.added ?? 0
    const removed = git.removed ?? 0
    if (!added && !removed) return null
    return { kind: 'delta', added, removed }
  },
}
