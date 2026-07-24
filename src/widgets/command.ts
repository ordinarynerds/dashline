import { spawn } from 'node:child_process'
import type { Ctx } from './types.ts'

const TIMEOUT_MS = 2000

// Runs a command item and resolves to its first non-empty line, or null on failure.
// The shell runs in its own process group (detached), so a timeout kills the shell and
// anything it spawned rather than orphaning them. Commands run concurrently; index.ts
// resolves them all before the synchronous render reads the results.
export function runCommand(cmd: string, ctx: Ctx): Promise<string | null> {
  return new Promise((resolve) => {
    let done = false
    const finish = (value: string | null) => {
      if (done) return
      done = true
      clearTimeout(timer)
      resolve(value)
    }

    const child = spawn(cmd, {
      shell: true,
      detached: true,
      env: { ...process.env, ...exported(ctx) },
      stdio: ['pipe', 'pipe', 'ignore'],
    })

    const timer = setTimeout(() => {
      if (child.pid) {
        try {
          process.kill(-child.pid, 'SIGKILL')
        } catch {}
      }
      finish(null)
    }, TIMEOUT_MS)

    let out = ''
    child.stdout.on('data', (chunk) => {
      out += chunk
    })
    child.on('error', () => finish(null))
    child.on('close', () => {
      const line = out.split('\n').find((l) => l.trim().length > 0)
      finish(line ? line.replace(/\s+$/, '') : null)
    })

    child.stdin.on('error', () => {})
    child.stdin.end(JSON.stringify(ctx.payload))
  })
}

function exported(ctx: Ctx): Record<string, string> {
  return {
    DASHLINE_BRANCH: ctx.git.branch ?? '',
    DASHLINE_WORKTREE: ctx.git.worktree ?? '',
    DASHLINE_CWD: ctx.payload.workspace?.current_dir ?? ctx.payload.cwd ?? '',
  }
}
