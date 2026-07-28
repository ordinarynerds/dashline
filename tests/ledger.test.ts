import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { recordSpend, weekStart, WEEK } from '../src/ledger.ts'

function withDir(fn: (dir: string) => void): void {
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

const NOW = 1_000_000

test('sums the running total across separate sessions', () => {
  withDir(() => {
    assert.equal(recordSpend('a', 1.5, NOW, NOW - WEEK), 1.5)
    assert.equal(recordSpend('b', 2.25, NOW, NOW - WEEK), 3.75)
  })
})

test('a session replaces its own entry rather than adding to it', () => {
  withDir(() => {
    recordSpend('a', 1, NOW, NOW - WEEK)
    assert.equal(recordSpend('a', 4, NOW + 10, NOW - WEEK), 4)
  })
})

test('a cost that has not moved is not rewritten', () => {
  withDir((state) => {
    recordSpend('a', 1, NOW, NOW - WEEK)
    const before = readFileSync(join(state, 'spend.json'), 'utf8')
    assert.equal(recordSpend('a', 1, NOW + 1, NOW - WEEK), 1)
    assert.equal(readFileSync(join(state, 'spend.json'), 'utf8'), before)
  })
})

test('drops entries that fell out of the window', () => {
  withDir(() => {
    recordSpend('old', 10, NOW - WEEK - 100, NOW - 2 * WEEK)
    assert.equal(recordSpend('new', 2, NOW, NOW - WEEK), 2)
  })
})

test('a stale entry cannot inflate a render that writes nothing', () => {
  withDir(() => {
    recordSpend('old', 10, NOW - WEEK - 100, NOW - 2 * WEEK)
    // No session id, so nothing is written — the sum must still exclude the expired entry.
    assert.equal(recordSpend(undefined, 5, NOW, NOW - WEEK), null)
    assert.equal(recordSpend('x', 0, NOW, NOW - WEEK), 0)
  })
})

test('needs a session id to tell sessions apart', () => {
  withDir(() => {
    assert.equal(recordSpend(undefined, 5, NOW, NOW - WEEK), null)
    assert.equal(recordSpend('', 5, NOW, NOW - WEEK), null)
  })
})

test('survives a corrupt or unexpected ledger file', () => {
  withDir((state) => {
    mkdirSync(state, { recursive: true })
    writeFileSync(join(state, 'spend.json'), 'not json at all')
    assert.equal(recordSpend('a', 3, NOW, NOW - WEEK), 3)
    writeFileSync(join(state, 'spend.json'), '[1,2,3]')
    assert.equal(recordSpend('a', 3, NOW, NOW - WEEK), 3)
  })
})

test('ignores entries whose shape is wrong', () => {
  withDir((state) => {
    mkdirSync(state, { recursive: true })
    writeFileSync(join(state, 'spend.json'), JSON.stringify({ a: { t: 'x', usd: 9 }, b: null, c: { t: NOW, usd: 2 } }))
    assert.equal(recordSpend('d', 1, NOW, NOW - WEEK), 3)
  })
})

test('a null cost reads the total without recording', () => {
  withDir(() => {
    recordSpend('a', 4, NOW, NOW - WEEK)
    assert.equal(recordSpend('b', null, NOW, NOW - WEEK), 4)
  })
})

test('weekStart anchors on the plan reset so the window matches `weekly`', () => {
  const resets = NOW + 3 * 86400
  assert.equal(weekStart(resets, NOW), resets - WEEK)
})

test('weekStart falls back to a rolling week with no published reset', () => {
  assert.equal(weekStart(undefined, NOW), NOW - WEEK)
})

test('weekStart walks a stale reset forward to the window holding now', () => {
  const start = weekStart(NOW - 3 * WEEK + 86400, NOW)
  assert.ok(start <= NOW && start + WEEK > NOW, `window ${start} does not contain ${NOW}`)
})

test('weekStart handles an absurdly old reset without looping', () => {
  const start = weekStart(0, NOW)
  assert.ok(start <= NOW && start + WEEK > NOW, `window ${start} does not contain ${NOW}`)
})
