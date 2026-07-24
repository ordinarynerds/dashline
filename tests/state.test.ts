import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sampleHistory } from '../src/state.ts'

function withDir(fn: () => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'dl-state-'))
  const prev = process.env.CLAUDE_CONFIG_DIR
  process.env.CLAUDE_CONFIG_DIR = dir
  try {
    fn()
  } finally {
    if (prev === undefined) delete process.env.CLAUDE_CONFIG_DIR
    else process.env.CLAUDE_CONFIG_DIR = prev
    rmSync(dir, { recursive: true, force: true })
  }
}

test('records samples and returns growing history', () => {
  withDir(() => {
    assert.equal(sampleHistory('s1', 10, 1, 100).length, 1)
    const h = sampleHistory('s1', 12, 1, 110)
    assert.equal(h.length, 2)
    assert.equal(h[1]!.ctx, 12)
  })
})

test('throttles samples taken within the gap', () => {
  withDir(() => {
    sampleHistory('s1', 10, null, 100)
    assert.equal(sampleHistory('s1', 11, null, 102).length, 1)
  })
})

test('an absent session id yields no history and no file write', () => {
  withDir(() => {
    assert.deepEqual(sampleHistory(undefined, 10, 1, 100), [])
  })
})

test('sessions are kept isolated', () => {
  withDir(() => {
    sampleHistory('a', 10, null, 100)
    const h = sampleHistory('b', 50, null, 100)
    assert.equal(h.length, 1)
    assert.equal(h[0]!.ctx, 50)
  })
})
