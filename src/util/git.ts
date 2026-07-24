import { execFileSync } from 'node:child_process'
import { basename } from 'node:path'

export interface GitInfo {
  branch?: string
  worktree?: string
}

export function readGit(dir: string | undefined, worktreeHint?: string): GitInfo {
  if (!dir) return {}
  const out = run(dir, ['rev-parse', '--abbrev-ref', 'HEAD', '--absolute-git-dir'])
  if (!out) return {}

  const [head, gitDir] = out.split('\n')
  let branch = head
  if (branch === 'HEAD') {
    branch = run(dir, ['rev-parse', '--short', 'HEAD']) ?? 'HEAD'
  }

  let worktree = worktreeHint
  if (!worktree && gitDir?.includes('/worktrees/')) {
    const top = run(dir, ['rev-parse', '--show-toplevel'])
    if (top) worktree = basename(top)
  }

  return { branch: branch || undefined, worktree }
}

function run(dir: string, args: string[]): string | undefined {
  try {
    return execFileSync('git', ['-C', dir, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return undefined
  }
}
