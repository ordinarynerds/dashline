import type { Widget } from './types.ts'

// An empty stash and an unprobed one both read as nothing to show.
export const stash: Widget = {
  needs: { status: true },
  data({ git }) {
    if (!git.stash) return null
    return { kind: 'label', text: `⚑${git.stash}`, color: 'dim' }
  },
}
