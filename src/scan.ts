import type { Item, LineSpec } from './config.ts'
import { widgetNames } from './widgets/registry.ts'

const GIT_WIDGETS = new Set(['branch', 'worktree'])
const HISTORY_WIDGETS = new Set(['burn'])

export interface Scan {
  commands: string[]
  usesGit: boolean
  usesHistory: boolean
}

// One pass over the resolved config: which command items to run, whether anything needs
// git, and whether any widget reads session history. Commands need git too, since they
// receive $DASHLINE_BRANCH/$DASHLINE_WORKTREE.
export function scan(lines: LineSpec[]): Scan {
  const commands = new Set<string>()
  let usesGit = false
  let usesHistory = false

  for (const line of lines) {
    const zones = Array.isArray(line) ? { left: line } : line
    for (const items of [zones.left, zones.center, zones.right]) {
      if (!items) continue
      for (const item of items) {
        if (usesHistoryItem(item)) usesHistory = true
        const id = itemId(item)
        if (id === null) continue
        if (widgetNames.has(id)) {
          if (GIT_WIDGETS.has(id)) usesGit = true
          if (HISTORY_WIDGETS.has(id)) usesHistory = true
        } else {
          commands.add(id)
          usesGit = true
        }
      }
    }
  }

  return { commands: [...commands], usesGit, usesHistory }
}

function itemId(item: Item): string | null {
  if (typeof item === 'string') return item
  if (Array.isArray(item)) return item[0]
  return null
}

// The `history` variant and the `trend` option both read session history.
function usesHistoryItem(item: Item): boolean {
  if (!Array.isArray(item)) return false
  const opt = item[1]
  if (opt === 'history') return true
  return typeof opt === 'object' && (opt.variant === 'history' || Boolean(opt.trend))
}
