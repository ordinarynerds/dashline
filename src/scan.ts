import type { Item, LineSpec } from './config.ts'
import { widgetNames } from './widgets/registry.ts'

const GIT_WIDGETS = new Set(['branch', 'worktree'])

export interface Scan {
  commands: string[]
  usesGit: boolean
}

// One pass over the resolved config: which command items to run, and whether anything
// needs git. Commands need it too, since they receive $DASHLINE_BRANCH/$DASHLINE_WORKTREE.
export function scan(lines: LineSpec[]): Scan {
  const commands = new Set<string>()
  let usesGit = false

  for (const line of lines) {
    const zones = Array.isArray(line) ? { left: line } : line
    for (const items of [zones.left, zones.center, zones.right]) {
      if (!items) continue
      for (const item of items) {
        const id = itemId(item)
        if (id === null) continue
        if (widgetNames.has(id)) {
          if (GIT_WIDGETS.has(id)) usesGit = true
        } else {
          commands.add(id)
          usesGit = true
        }
      }
    }
  }

  return { commands: [...commands], usesGit }
}

function itemId(item: Item): string | null {
  if (typeof item === 'string') return item
  if (Array.isArray(item)) return item[0]
  return null
}
