import { readFileSync, writeFileSync, renameSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export interface Sample {
  t: number
  ctx: number | null
  cost: number | null
}

const GAP = 5 // seconds between kept samples
const KEEP = 60 // samples per session
const MAX_SESSIONS = 20
const SESSION_TTL = 6 * 3600

// Each session owns its own file, so two sessions never write the same file and there is
// no read-modify-write race. All IO is best-effort: a status line must never fail on it.
function stateDir(): string {
  const base = process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude')
  return join(base, 'dashline-state')
}

export function sampleHistory(sessionId: string | undefined, ctx: number | null, cost: number | null, now: number): Sample[] {
  const id = (sessionId ?? '').replace(/[^a-zA-Z0-9_-]/g, '')
  if (!id) return []
  const dir = stateDir()
  const file = join(dir, `${id}.json`)

  let samples: Sample[] = []
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as unknown
    if (Array.isArray(parsed)) samples = parsed as Sample[]
  } catch {}

  const isNew = samples.length === 0
  const last = samples[samples.length - 1]
  const appended = !last || now - last.t >= GAP
  if (appended) {
    samples.push({ t: now, ctx, cost })
    if (samples.length > KEEP) samples.splice(0, samples.length - KEEP)
  }

  // Only touch disk when the sample list actually changed; a throttled render is a no-op.
  if (appended) {
    try {
      mkdirSync(dir, { recursive: true })
      const tmp = `${file}.tmp`
      writeFileSync(tmp, JSON.stringify(samples))
      renameSync(tmp, file)
      if (isNew) prune(dir, now) // sweep stale sessions once, when a new one starts
    } catch {}
  }

  return samples
}

function prune(dir: string, now: number): void {
  let files: string[]
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  } catch {
    return
  }

  const alive: { path: string; t: number }[] = []
  for (const f of files) {
    const path = join(dir, f)
    try {
      const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown
      const samples = Array.isArray(parsed) ? (parsed as Sample[]) : []
      const last = samples[samples.length - 1]
      if (!last || now - last.t > SESSION_TTL) rmSync(path, { force: true })
      else alive.push({ path, t: last.t })
    } catch {
      rmSync(path, { force: true })
    }
  }

  if (alive.length > MAX_SESSIONS) {
    alive
      .sort((a, b) => a.t - b.t)
      .slice(0, alive.length - MAX_SESSIONS)
      .forEach((x) => rmSync(x.path, { force: true }))
  }
}
