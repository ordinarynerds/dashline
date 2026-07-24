import { parsePayload } from './payload.ts'
import { loadConfig } from './config.ts'
import { readGit } from './util/git.ts'
import { scan } from './scan.ts'
import { runCommand } from './widgets/command.ts'
import { render } from './render.ts'
import type { Ctx } from './widgets/types.ts'

const raw = await readStdin()
const payload = parsePayload(raw)
const config = loadConfig(payload)
const dir = payload.workspace?.current_dir ?? payload.cwd
const { commands, usesGit } = scan(config.lines)

const ctx: Ctx = {
  payload,
  git: usesGit ? readGit(dir, payload.workspace?.git_worktree) : {},
  thresholds: {
    warning: config.contextWarningAt,
    critical: config.contextCriticalAt,
    usageWarning: config.usageWarningAt,
    usageCritical: config.usageCriticalAt,
  },
  now: Math.floor(Date.now() / 1000),
}

const resolved = await Promise.all(commands.map((cmd) => runCommand(cmd, ctx).then((out) => [cmd, out] as const)))
ctx.commands = new Map(resolved)

const columns = Number(process.env.COLUMNS) || 80
try {
  const lines = render(config, ctx, columns)
  if (lines.length > 0) process.stdout.write(`${lines.join('\n')}\n`)
} catch {
  // A status line that throws prints a stack trace into the prompt. Better to show nothing.
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}
