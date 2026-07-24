import { test } from 'node:test'
import assert from 'node:assert/strict'
import { human, duration, spark } from '../src/util/format.ts'

test('human switches to M once rounding would reach 1000k', () => {
  assert.equal(human(440_000), '440k')
  assert.equal(human(999_499), '999k')
  assert.equal(human(999_500), '1.0M')
  assert.equal(human(1_000_000), '1.0M')
})

test('duration reads down from hours to seconds', () => {
  assert.equal(duration(2_220_000), '37m')
  assert.equal(duration(3_660_000), '1h01m')
  assert.equal(duration(45_000), '45s')
})

test('spark maps percentages to block heights of a fixed length', () => {
  const s = spark([0, 25, 50, 75, 100])
  assert.equal([...s].length, 5)
  assert.ok(s.startsWith('▁'))
  assert.ok(s.endsWith('█'))
})
