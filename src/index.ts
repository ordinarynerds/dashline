import { parsePayload } from './payload.ts'
import { loadConfig } from './config.ts'
import { readGit } from './util/git.ts'
import { render } from './render.ts'
import type { Ctx } from './widgets/types.ts'

const raw = await readStdin()
const payload = parsePayload(raw)
const config = loadConfig(payload)
const dir = payload.workspace?.current_dir ?? payload.cwd

const ctx: Ctx = {
  payload,
  git: readGit(dir, payload.workspace?.git_worktree),
  thresholds: {
    warn: config.warn,
    compact: config.compact,
    usageWarn: config.usageWarn,
    usageCrit: config.usageCrit,
  },
  now: Math.floor(Date.now() / 1000),
}

const columns = Number(process.env.COLUMNS) || 80
const lines = render(config, ctx, columns)
if (lines.length > 0) process.stdout.write(`${lines.join('\n')}\n`)

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}
