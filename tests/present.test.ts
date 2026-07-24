import { test } from 'node:test'
import assert from 'node:assert/strict'
import { percent } from '../src/present/percent.ts'
import { label } from '../src/present/label.ts'
import { visibleWidth, strip } from '../src/util/width.ts'
import type { Ctx } from '../src/widgets/types.ts'
import type { Percent, Label } from '../src/datum.ts'

const ctx: Ctx = {
  payload: {},
  git: {},
  thresholds: { warn: 40, compact: 50, usageWarn: 70, usageCrit: 90 },
  now: 1000,
}

test('percent: per-item bar width', () => {
  const d: Percent = { kind: 'percent', value: 50, scale: 'usage' }
  assert.equal(visibleWidth(percent(d, { variant: 'bar', width: 16 }, ctx)), 16)
})

test('percent: per-item warn/crit override the color', () => {
  const d: Percent = { kind: 'percent', value: 44, scale: 'context' }
  assert.match(percent(d, { variant: 'pct', crit: 30 }, ctx), /1;31m/) // red at 44 when crit is 30
  assert.match(percent(d, { variant: 'pct', warn: 60, crit: 80 }, ctx), /1;32m/) // green when raised
})

test('percent: label override and countdown toggle', () => {
  const d: Percent = { kind: 'percent', value: 61, scale: 'usage', label: 'session', reset: 2_000_000 }
  assert.equal(strip(percent(d, { label: '5h', countdown: false }, ctx)), '5h 61%')
})

test('label: truncate as a number and icon override', () => {
  const d: Label = { kind: 'label', text: 'feature-branch-name' }
  assert.equal(strip(label(d, { truncate: 6 })), 'featu…')
  assert.equal(strip(label({ kind: 'label', text: 'main' }, { icon: '#' })), '# main')
})
