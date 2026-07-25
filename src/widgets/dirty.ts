import type { Widget } from './types.ts'
import type { Label } from '../datum.ts'

// Symbols follow the porcelain columns: + staged, * unstaged, ? untracked, ! conflicted.
// Each part is also its own variant, because a label carries one color: three items
// compose the three-color reading that a single item cannot.
export const dirty: Widget = {
  needs: { status: true },
  data({ git }, opts) {
    if (git.staged == null) return null // status was never probed

    const staged = git.staged
    const unstaged = git.unstaged ?? 0
    const untracked = git.untracked ?? 0
    const conflicts = git.conflicts ?? 0
    const clean = !staged && !unstaged && !untracked && !conflicts

    switch (opts.variant) {
      case 'staged':
        return part(staged, '+', 'green')
      case 'unstaged':
        return part(unstaged, '*', 'yellow')
      case 'untracked':
        return part(untracked, '?', 'red')
      case 'conflicts':
        return part(conflicts, '!', 'red')
      case 'clean':
        return clean ? { kind: 'label', text: '✓', color: 'green' } : null
      case 'flags': {
        if (clean) return null
        const text = `${staged ? '+' : ''}${unstaged ? '*' : ''}${untracked ? '?' : ''}${conflicts ? '!' : ''}`
        return { kind: 'label', text, color: conflicts ? 'red' : 'yellow' }
      }
      default: {
        if (clean) return null
        const parts = []
        if (staged) parts.push(`+${staged}`)
        if (unstaged) parts.push(`*${unstaged}`)
        if (untracked) parts.push(`?${untracked}`)
        if (conflicts) parts.push(`!${conflicts}`)
        return { kind: 'label', text: parts.join(' '), color: conflicts ? 'red' : 'yellow' }
      }
    }
  },
}

function part(n: number, symbol: string, color: string): Label | null {
  return n ? { kind: 'label', text: `${symbol}${n}`, color } : null
}
