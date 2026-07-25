import type { Widget } from './types.ts'

// Distance from the upstream. Both counts stay unset when the branch has no upstream,
// so the widget hides rather than claiming a branch is in sync with nothing.
export const sync: Widget = {
  needs: { status: true },
  data({ git }, opts) {
    const { ahead, behind } = git
    if (ahead == null || behind == null) return null

    if (opts.variant === 'ahead') return ahead ? { kind: 'label', text: `↑${ahead}`, color: 'green' } : null
    if (opts.variant === 'behind') return behind ? { kind: 'label', text: `↓${behind}`, color: 'yellow' } : null
    if (opts.variant === 'synced') return !ahead && !behind ? { kind: 'label', text: '≡', color: 'green' } : null

    if (!ahead && !behind) return null
    const text = `${ahead ? `↑${ahead}` : ''}${behind ? `↓${behind}` : ''}`
    return { kind: 'label', text, color: behind ? 'yellow' : 'green' }
  },
}
