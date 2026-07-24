import { test } from 'node:test'
import assert from 'node:assert/strict'
import { paint, sanitize, isStyle } from '../src/style.ts'

const ESC = String.fromCharCode(27)

test('a repeated code is emitted once, so "bold red" does not double the bold', () => {
  assert.equal(paint('x', 'bold red'), `${ESC}[1;31mx${ESC}[0m`)
  assert.equal(paint('x', 'red'), `${ESC}[1;31mx${ESC}[0m`)
})

test('unknown terms paint nothing', () => {
  assert.equal(paint('x', 'chartreuse'), 'x')
  assert.equal(isStyle('chartreuse'), false)
  assert.equal(isStyle('bold red'), true)
})

test('sanitize removes control characters, including ESC and BEL', () => {
  assert.equal(sanitize(`a${String.fromCharCode(27)}]0;title${String.fromCharCode(7)}b`), 'a]0;titleb')
  assert.equal(sanitize('plain text'), 'plain text')
})
