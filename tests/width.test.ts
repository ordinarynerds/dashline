import { test } from 'node:test'
import assert from 'node:assert/strict'
import { visibleWidth } from '../src/util/width.ts'

const ESC = String.fromCharCode(27)

test('ascii and dashline glyphs are one column each', () => {
  assert.equal(visibleWidth('main'), 4)
  assert.equal(visibleWidth('⎇ █░'), 4)
})

test('east asian characters are two columns', () => {
  assert.equal(visibleWidth('你好'), 4)
  assert.equal(visibleWidth('こんにちは'), 10)
})

test('combining marks and zero-width joiners add nothing', () => {
  assert.equal(visibleWidth('e' + String.fromCharCode(0x301)), 1)
  assert.equal(visibleWidth('a' + String.fromCharCode(0x200d) + 'b'), 2)
})

test('ansi escape codes are not counted', () => {
  assert.equal(visibleWidth(`${ESC}[31mhi${ESC}[0m`), 2)
})
