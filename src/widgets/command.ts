import { execSync } from 'node:child_process'
import type { Ctx } from './types.ts'

export function runCommand(cmd: string, ctx: Ctx): string | null {
  try {
    const out = execSync(cmd, {
      encoding: 'utf8',
      timeout: 2000,
      input: JSON.stringify(ctx.payload),
      stdio: ['pipe', 'pipe', 'ignore'],
      env: { ...process.env, ...exported(ctx) },
    })
    const line = out.split('\n').find((l) => l.trim().length > 0)
    return line ? line.replace(/\s+$/, '') : null
  } catch {
    return null
  }
}

function exported(ctx: Ctx): Record<string, string> {
  return {
    DASHLINE_BRANCH: ctx.git.branch ?? '',
    DASHLINE_WORKTREE: ctx.git.worktree ?? '',
    DASHLINE_CWD: ctx.payload.workspace?.current_dir ?? ctx.payload.cwd ?? '',
  }
}
