import { test } from 'node:test'
import assert from 'node:assert/strict'
import { percent } from '../src/present/percent.ts'
import { label } from '../src/present/label.ts'
import { duration, delta } from '../src/present/scalars.ts'
import { gradientBar } from '../src/present/gradient.ts'
import { visibleWidth, strip } from '../src/util/width.ts'
import type { Ctx } from '../src/widgets/types.ts'
import type { Percent, Label, Duration, Delta } from '../src/datum.ts'

const ctx: Ctx = {
  payload: {},
  git: {},
  thresholds: { warning: 40, critical: 50, usageWarning: 70, usageCritical: 90 },
  now: 1000,
}

test('percent: per-item bar width', () => {
  const d: Percent = { kind: 'percent', value: 50, scale: 'usage' }
  assert.equal(visibleWidth(percent(d, { variant: 'bar', width: 16 }, ctx)), 16)
})

test('gradient bar keeps its width and colors filled cells with truecolor', () => {
  const b = gradientBar(60, 10)
  assert.equal(visibleWidth(b), 10)
  assert.match(b, /38;2;/)
})

test('gradient empty cells reset the foreground before dimming', () => {
  assert.match(gradientBar(50, 10), /\[0;2m░/)
})

test('label truncate respects display width and does not split code points', () => {
  assert.ok(visibleWidth(label({ kind: 'label', text: '你好世界' }, { truncate: 4 })) <= 4)
  // whole emoji kept, not a split surrogate pair
  assert.equal(label({ kind: 'label', text: '🎉🎉🎉' }, { truncate: 3 }), '🎉…')
})

test('percent: gradient bar variant is per-cell colored', () => {
  const d: Percent = { kind: 'percent', value: 70, scale: 'context' }
  assert.match(percent(d, { variant: 'bar', bar: 'gradient' }, ctx), /38;2;/)
})

test('percent: per-item warn/crit override the color', () => {
  const d: Percent = { kind: 'percent', value: 44, scale: 'context' }
  assert.match(percent(d, { variant: 'pct', criticalAt: 30 }, ctx), /1;31m/) // red at 44 when critical is 30
  assert.match(percent(d, { variant: 'pct', warningAt: 60, criticalAt: 80 }, ctx), /1;32m/) // green when raised
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

test('label: bold, italic, and underline each emit their SGR attribute', () => {
  const d: Label = { kind: 'label', text: 'main' }
  assert.match(label(d, { bold: true }), /\[1m/)
  assert.match(label(d, { italic: true }), /\[3m/)
  assert.match(label(d, { underline: true }), /\[4m/)
})

test('label: an attribute rides in the same SGR group as the color', () => {
  const d: Label = { kind: 'label', text: 'main' }
  // cyan + bold -> both 36 and 1 in one escape, not two separate groups
  assert.match(label(d, { color: 'cyan', bold: true }), /\[36;1m/)
  // multiple attributes combine with the color
  assert.match(label(d, { color: 'cyan', bold: true, underline: true }), /\[36;1;4m/)
})

test('duration: attributes combine with its default color', () => {
  const d: Duration = { kind: 'duration', ms: 2_220_000 }
  assert.match(duration(d, { italic: true }), /\[2;3m/) // dim default + italic
})

test('delta: attributes style every segment of the +added -removed pair', () => {
  const d: Delta = { kind: 'delta', added: 5, removed: 2 }
  const out = delta(d, { underline: true })
  assert.match(out, /\[32;4m/) // +added, green + underline
  assert.match(out, /\[31;4m/) // -removed, red + underline
})

test('percent: attributes fold into the number and the bar, colored per fill', () => {
  const d: Percent = { kind: 'percent', value: 50, scale: 'usage' }
  // number is already bold; underline joins the same SGR
  assert.match(percent(d, { variant: 'pct', underline: true }, ctx), /\[1;32;4m/)
  // the colored bar carries the attribute too
  assert.match(percent(d, { variant: 'bar', underline: true }, ctx), /\[32;4m/)
})

test('percent: attributes also style the composed detail (tokens, countdown)', () => {
  const withTokens: Percent = { kind: 'percent', value: 44, scale: 'context', tokens: { used: 440_000, size: 1_000_000 } }
  // the (used/size) token detail stays dim but carries the underline attribute
  assert.match(percent(withTokens, { underline: true }, ctx), /\[2;4m\(/)

  const withReset: Percent = { kind: 'percent', value: 61, scale: 'usage', reset: 2_000_000 }
  // the (↻…) countdown detail is dim + underline too
  assert.match(percent(withReset, { underline: true }, ctx), /\[2;4m\(↻/)
})

test('gradient bar folds attributes into each cell so the whole bar stays styled', () => {
  const b = gradientBar(60, 10, { underline: true })
  assert.match(b, /38;2;\d+;\d+;\d+;4m/) // filled cell: truecolor + underline
  assert.match(b, /\[0;2;4m░/) // empty cell: reset, dim, underline
})
