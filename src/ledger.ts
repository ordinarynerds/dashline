import { readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { stateDir } from './state.ts'

export const WEEK = 7 * 86400

// Spend across every session in the current week, which nothing hands us.
//
// The payload carries `cost.total_cost_usd` for *this* session and a percentage for the weekly
// quota, but no money figure spanning sessions. The other places that look like they might have
// one do not: ~/.claude/stats-cache.json reports costUSD: 0 for every model, and the transcripts
// record token counts with no cost attached — deriving money from those would mean shipping a
// per-model price table and keeping it current, in a package with no dependencies.
//
// So dashline keeps its own tally. Each session's cumulative total is written under its id and
// the entries are summed, which is why an id is required: without one a session cannot be told
// apart from the last, and the same spend would be counted twice or overwrite its predecessor.
interface Entry {
  t: number
  usd: number
}

type Ledger = Record<string, Entry>

// Idle renders do not touch the disk. A changed total always does, though: this file replaces an
// entry rather than appending to one, so it stays a few hundred bytes however often it is written,
// and the history sampler's reason for throttling hard does not apply.
const GAP = 5

// One shared file rather than a file per session, the opposite of the choice in state.ts, because
// this reads every session at once and a week's worth is far more files than that sampler's 20.
// The read-modify-write race that split files avoid is survivable here: writes are atomic through
// rename so the file cannot tear, and a clobbered entry is restored by its own session's next
// render, since every write carries that session's running total rather than a delta.
function ledgerFile(): string {
  return join(stateDir(), 'spend.json')
}

export function recordSpend(sessionId: string | undefined, usd: number | null, now: number, since: number): number | null {
  const id = (sessionId ?? '').replace(/[^a-zA-Z0-9_-]/g, '')
  if (!id) return null

  const file = ledgerFile()
  let ledger: Ledger = {}
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ledger = parsed as Ledger
  } catch {}

  // Entries that fell out of the window go before anything is summed, so a stale file cannot
  // inflate the total even on a render that decides not to write.
  for (const [key, entry] of Object.entries(ledger)) {
    if (!entry || typeof entry.t !== 'number' || typeof entry.usd !== 'number' || entry.t < since) delete ledger[key]
  }

  const own = ledger[id]
  if (usd != null && (!own || now - own.t >= GAP || usd !== own.usd)) {
    ledger[id] = { t: now, usd }
    try {
      const dir = stateDir()
      mkdirSync(dir, { recursive: true })
      const tmp = `${file}.tmp`
      writeFileSync(tmp, JSON.stringify(ledger))
      renameSync(tmp, file)
    } catch {}
  }

  let total = 0
  for (const entry of Object.values(ledger)) total += entry.usd
  return total
}

// When the week turns over. The plan's own quota window is the one worth reporting against, so
// the reset the payload already advertises anchors it and the total lines up with what `weekly`
// shows as a percentage. Without that reset there is no published boundary to honour, and a
// rolling seven days is the honest fallback.
export function weekStart(resetsAt: number | undefined, now: number): number {
  if (resetsAt == null || !Number.isFinite(resetsAt)) return now - WEEK
  const start = resetsAt - WEEK
  // A reset far in the past means a stale payload. Step forward to the window holding `now` in one
  // move rather than a loop, so a nonsense timestamp costs arithmetic instead of a million turns.
  if (start + WEEK > now) return start
  return start + Math.floor((now - start) / WEEK) * WEEK
}
