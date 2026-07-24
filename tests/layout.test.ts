import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compose } from '../src/layout.ts'
import { visibleWidth, strip } from '../src/util/width.ts'

test('left only returns left untouched', () => {
  assert.equal(compose('left', '', '', 80, 5), 'left')
})

test('left and right are justified to columns minus margin', () => {
  const out = compose('L', '', 'R', 20, 5)
  assert.equal(visibleWidth(out), 15)
  assert.ok(out.startsWith('L'))
  assert.ok(out.endsWith('R'))
})

test('a line too wide to fit is clipped, never overflowed', () => {
  const out = compose('wide-left-side', '', 'wide-right-side', 10, 5)
  assert.ok(visibleWidth(out) <= 5, `got width ${visibleWidth(out)}`)
})

test('when left and right cannot both fit, the right zone is kept and the left is clipped', () => {
  const out = compose('a-very-long-left-zone', '', 'R', 20, 5)
  assert.ok(visibleWidth(out) <= 15)
  assert.ok(strip(out).endsWith('R'))
  assert.ok(strip(out).includes('…'))
})

test('a long left-only line is clipped to the width', () => {
  const out = compose('abcdefghijklmnop', '', '', 13, 5)
  assert.ok(visibleWidth(out) <= 8)
  assert.ok(strip(out).endsWith('…'))
})

test('center sits between left and right', () => {
  const out = strip(compose('L', 'C', 'R', 30, 0))
  assert.ok(out.startsWith('L'))
  assert.ok(out.endsWith('R'))
  assert.ok(out.includes('C'))
  const mid = out.indexOf('C')
  assert.ok(mid > 5 && mid < 25)
})

test('visibleWidth ignores ANSI codes', () => {
  assert.equal(visibleWidth('\x1b[32mhi\x1b[0m'), 2)
})
