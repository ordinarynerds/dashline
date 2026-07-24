import type { Widget } from './types.ts'
import { branch } from './branch.ts'
import { model } from './model.ts'
import { context } from './context.ts'
import { session, weekly } from './usage.ts'
import { cost } from './cost.ts'
import { duration } from './duration.ts'
import { lines } from './lines.ts'
import { pr } from './pr.ts'
import { review } from './review.ts'
import { worktree } from './worktree.ts'
import { cwd } from './cwd.ts'
import { repo } from './repo.ts'
import { effort } from './effort.ts'
import { name } from './name.ts'
import { output } from './output.ts'
import { version } from './version.ts'
import { fast, thinking, vim, agent } from './flags.ts'

export const registry: Record<string, Widget> = {
  branch,
  model,
  context,
  session,
  weekly,
  cost,
  duration,
  lines,
  pr,
  review,
  worktree,
  cwd,
  repo,
  effort,
  name,
  output,
  version,
  fast,
  thinking,
  vim,
  agent,
}

export const widgetNames = new Set(Object.keys(registry))
