import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { recordSpend, weekStart, monthStart, WEEK, type Spend } from '../src/ledger.ts'

function withDir(fn: (state: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'dl-ledger-'))
  const prev = process.env.CLAUDE_CONFIG_DIR
  process.env.CLAUDE_CONFIG_DIR = dir
  try {
    fn(join(dir, 'dashline-state'))
  } finally {
    if (prev === undefined) delete process.env.CLAUDE_CONFIG_DIR
    else process.env.CLAUDE_CONFIG_DIR = prev
    rmSync(dir, { recursive: true, force: true })
  }
}

// Built from a local Date rather than a literal, so the month boundary lands where the code puts
// it whatever timezone the suite runs in. Mid-month and mid-day, clear of every edge.
const NOW = Math.floor(new Date(2026, 6, 15, 12, 0, 0).getTime() / 1000)
const DAY = 86400

const week = (s: Spend | null) => s?.week
const month = (s: Spend | null) => s?.month

// Places an entry at a chosen time. recordSpend always stamps `now`, so backdating has to go
// through the file the same way a previous run's entry would have.
function seed(state: string, entries: Record<string, unknown>): void {
  mkdirSync(state, { recursive: true })
  writeFileSync(join(state, 'spend.json'), JSON.stringify(entries))
}

test('sums the running total across separate sessions', () => {
  withDir(() => {
    assert.equal(week(recordSpend('a', 1.5, NOW, undefined)), 1.5)
    assert.equal(week(recordSpend('b', 2.25, NOW, undefined)), 3.75)
  })
})

test('a session replaces its own entry rather than adding to it', () => {
  withDir(() => {
    recordSpend('a', 1, NOW, undefined)
    assert.equal(week(recordSpend('a', 4, NOW + 10, undefined)), 4)
  })
})

test('a cost that has not moved is not rewritten', () => {
  withDir((state) => {
    recordSpend('a', 1, NOW, undefined)
    const before = readFileSync(join(state, 'spend.json'), 'utf8')
    assert.equal(week(recordSpend('a', 1, NOW + 1, undefined)), 1)
    assert.equal(readFileSync(join(state, 'spend.json'), 'utf8'), before)
  })
})

test('the month includes spend the week has already left behind', () => {
  withDir((state) => {
    seed(state, { earlier: { t: NOW - 10 * DAY, usd: 100 } })
    const s = recordSpend('now', 5, NOW, undefined)
    assert.equal(week(s), 5, 'ten days ago is outside a rolling week')
    assert.equal(month(s), 105, 'but inside the same calendar month')
  })
})

test('drops entries older than every period', () => {
  withDir((state) => {
    seed(state, { ancient: { t: NOW - 60 * DAY, usd: 100 } })
    const s = recordSpend('now', 2, NOW, undefined)
    assert.equal(week(s), 2)
    assert.equal(month(s), 2)
  })
})

test('on the first of the month the week still reaches back further', () => {
  withDir((state) => {
    // Retention has to follow whichever period looks furthest back, which here is the week.
    const first = monthStart(NOW)
    seed(state, { lastMonth: { t: first - 2 * DAY, usd: 30 } })
    const s = recordSpend('now', 5, first + 3600, undefined)
    assert.equal(month(s), 5, 'two days before the first is last month')
    assert.equal(week(s), 35, 'but well inside a rolling week')
  })
})

test('a stale entry cannot inflate a render that writes nothing', () => {
  withDir((state) => {
    seed(state, { ancient: { t: NOW - 60 * DAY, usd: 100 } })
    assert.equal(recordSpend(undefined, 5, NOW, undefined), null)
    assert.equal(week(recordSpend('x', 0, NOW, undefined)), 0)
  })
})

test('needs a session id to tell sessions apart', () => {
  withDir(() => {
    assert.equal(recordSpend(undefined, 5, NOW, undefined), null)
    assert.equal(recordSpend('', 5, NOW, undefined), null)
  })
})

test('survives a corrupt or unexpected ledger file', () => {
  withDir((state) => {
    mkdirSync(state, { recursive: true })
    writeFileSync(join(state, 'spend.json'), 'not json at all')
    assert.equal(week(recordSpend('a', 3, NOW, undefined)), 3)
    writeFileSync(join(state, 'spend.json'), '[1,2,3]')
    assert.equal(week(recordSpend('a', 3, NOW, undefined)), 3)
  })
})

test('ignores entries whose shape is wrong', () => {
  withDir((state) => {
    seed(state, { a: { t: 'x', usd: 9 }, b: null, c: { t: NOW, usd: 2 } })
    assert.equal(week(recordSpend('d', 1, NOW, undefined)), 3)
  })
})

test('a null cost reads the totals without recording', () => {
  withDir(() => {
    recordSpend('a', 4, NOW, undefined)
    assert.equal(week(recordSpend('b', null, NOW, undefined)), 4)
  })
})

test('weekStart anchors on the plan reset so the window matches `weekly`', () => {
  const resets = NOW + 3 * DAY
  assert.equal(weekStart(resets, NOW), resets - WEEK)
})

test('weekStart falls back to a rolling week with no published reset', () => {
  assert.equal(weekStart(undefined, NOW), NOW - WEEK)
})

test('weekStart walks a stale reset forward to the window holding now', () => {
  const start = weekStart(NOW - 3 * WEEK + DAY, NOW)
  assert.ok(start <= NOW && start + WEEK > NOW, `window ${start} does not contain ${NOW}`)
})

test('weekStart handles an absurdly old reset without looping', () => {
  const start = weekStart(0, NOW)
  assert.ok(start <= NOW && start + WEEK > NOW, `window ${start} does not contain ${NOW}`)
})

test('monthStart is local midnight on the first', () => {
  const d = new Date(monthStart(NOW) * 1000)
  assert.equal(d.getDate(), 1)
  assert.equal(d.getHours(), 0)
  assert.equal(d.getMonth(), new Date(NOW * 1000).getMonth())
})
