import type { Item, LineSpec } from './config.ts'
import type { GitNeeds } from './util/git.ts'
import type { Needs } from './widgets/types.ts'
import { registry } from './widgets/registry.ts'

// A command reads $DASHLINE_BRANCH and $DASHLINE_WORKTREE, so it needs the same lookups
// the branch and worktree widgets do.
const COMMAND_NEEDS: Needs = { branch: true, worktree: true }

export interface Scan {
  commands: string[]
  usesGit: boolean
  usesHistory: boolean
  gitNeeds: GitNeeds
}

// One pass over the resolved config: which command items to run, which git probes are
// needed, and whether any widget reads session history. Each widget declares its own
// needs, so this only has to union them.
export function scan(lines: LineSpec[]): Scan {
  const commands = new Set<string>()
  const needs: Needs = {}

  for (const line of lines) {
    const zones = Array.isArray(line) ? { left: line } : line
    for (const items of [zones.left, zones.center, zones.right]) {
      if (!items) continue
      for (const item of items) {
        if (usesHistoryItem(item)) needs.history = true
        const id = itemId(item)
        if (id === null) continue
        const widget = registry[id]
        if (widget) Object.assign(needs, widget.needs)
        else {
          commands.add(id)
          Object.assign(needs, COMMAND_NEEDS)
        }
      }
    }
  }

  const { history, ...gitNeeds } = needs
  return {
    commands: [...commands],
    usesGit: Object.values(gitNeeds).some(Boolean),
    usesHistory: Boolean(history),
    gitNeeds,
  }
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
