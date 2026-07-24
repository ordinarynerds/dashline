import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bar, barStyles } from '../src/util/bar.ts'
import { visibleWidth } from '../src/util/width.ts'

test('blocks fill in proportion and keep a fixed width', () => {
  assert.equal(bar(0, 10, 'blocks'), '░░░░░░░░░░')
  assert.equal(bar(100, 10, 'blocks'), '██████████')
  assert.equal(bar(50, 10, 'blocks'), '█████░░░░░')
})

test('unknown style falls back to blocks', () => {
  assert.equal(bar(50, 10, 'nope'), bar(50, 10, 'blocks'))
})

test('ascii brackets count inside the width', () => {
  assert.equal(bar(20, 5, 'ascii'), '[#--]')
  assert.equal(visibleWidth(bar(20, 5, 'ascii')), 5)
})

test('every style renders the same visible width', () => {
  for (const style of barStyles) {
    assert.equal(visibleWidth(bar(37, 10, style)), 10, `style ${style}`)
  }
})

test('fine style adds a sub-cell partial and preserves width', () => {
  assert.equal([...bar(23, 10, 'fine')].length, 10)
  assert.equal(bar(23, 10, 'fine'), '██▎░░░░░░░')
})

test('out-of-range percentages clamp', () => {
  assert.equal(bar(-5, 4, 'blocks'), '░░░░')
  assert.equal(bar(150, 4, 'blocks'), '████')
})
