import { test } from 'node:test'
import assert from 'node:assert/strict'
import { powerlineZone } from '../src/powerline.ts'
import { strip, visibleWidth } from '../src/util/width.ts'

const ARROW = String.fromCodePoint(0xe0b0)

test('pads each segment and joins them with the arrow glyph', () => {
  const bare = strip(powerlineZone([{ text: 'main', bg: null }, { text: 'Opus', bg: null }]))
  assert.ok(bare.includes(' main '))
  assert.ok(bare.includes(' Opus '))
  assert.equal([...bare].filter((c) => c === ARROW).length, 2)
})

test('a segment keeps its own background when set', () => {
  assert.ok(powerlineZone([{ text: 'PR', bg: '45' }]).includes('45m'))
})

test('the arrow and padding count toward visible width', () => {
  // " ab " (4) + arrow (1) = 5
  assert.equal(visibleWidth(powerlineZone([{ text: 'ab', bg: null }])), 5)
})
