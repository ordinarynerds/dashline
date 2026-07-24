import { readFileSync, writeFileSync, renameSync } from 'node:fs'
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

type Store = Record<string, Sample[]>

function statePath(): string {
  const dir = process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude')
  return join(dir, 'dashline-state.json')
}

// Append a sample for this session and return its recent history, oldest to newest. All IO
// is best-effort: a status line must never fail because of the state file.
export function sampleHistory(sessionId: string | undefined, ctx: number | null, cost: number | null, now: number): Sample[] {
  if (!sessionId) return []
  const path = statePath()

  let store: Store = {}
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown
    if (parsed && typeof parsed === 'object') store = parsed as Store
  } catch {}

  const samples = Array.isArray(store[sessionId]) ? store[sessionId]! : []
  const last = samples[samples.length - 1]
  if (!last || now - last.t >= GAP) {
    samples.push({ t: now, ctx, cost })
    if (samples.length > KEEP) samples.splice(0, samples.length - KEEP)
  }
  store[sessionId] = samples
  prune(store, now)

  try {
    const tmp = `${path}.tmp`
    writeFileSync(tmp, JSON.stringify(store))
    renameSync(tmp, path)
  } catch {}

  return samples
}

function prune(store: Store, now: number): void {
  for (const id of Object.keys(store)) {
    const s = store[id]!
    const last = s[s.length - 1]
    if (!last || now - last.t > SESSION_TTL) delete store[id]
  }
  const ids = Object.keys(store)
  if (ids.length > MAX_SESSIONS) {
    ids
      .map((id) => [id, store[id]![store[id]!.length - 1]?.t ?? 0] as const)
      .sort((a, b) => a[1] - b[1])
      .slice(0, ids.length - MAX_SESSIONS)
      .forEach(([id]) => delete store[id])
  }
}
