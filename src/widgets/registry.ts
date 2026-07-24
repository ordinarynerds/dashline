import type { Widget } from './types.ts'
import { branch } from './branch.ts'
import { model } from './model.ts'
import { context } from './context.ts'
import { session, weekly } from './usage.ts'
import { cost } from './cost.ts'
import { pr } from './pr.ts'
import { worktree } from './worktree.ts'
import { cwd } from './cwd.ts'
import { effort } from './effort.ts'
import { name } from './name.ts'
import { output } from './output.ts'

export const registry: Record<string, Widget> = {
  branch,
  model,
  context,
  session,
  weekly,
  cost,
  pr,
  worktree,
  cwd,
  effort,
  name,
  output,
}
