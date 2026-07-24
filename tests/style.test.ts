import { test } from 'node:test'
import assert from 'node:assert/strict'
import { paint, sanitize, isStyle, setTheme } from '../src/style.ts'

const ESC = String.fromCharCode(27)

test('a theme remaps named colors to hex, and clears back to defaults', () => {
  setTheme('nord')
  assert.equal(paint('x', 'cyan'), `${ESC}[38;2;136;192;208mx${ESC}[0m`) // nord cyan #88C0D0
  setTheme(undefined)
  assert.equal(paint('x', 'cyan'), `${ESC}[36mx${ESC}[0m`)
})

test('named colors map to SGR codes and bold composes', () => {
  assert.equal(paint('x', 'red'), `${ESC}[31mx${ESC}[0m`)
  assert.equal(paint('x', 'bold red'), `${ESC}[1;31mx${ESC}[0m`)
})

test('hex terms become 24-bit truecolor', () => {
  assert.equal(paint('x', '#4ec9d6'), `${ESC}[38;2;78;201;214mx${ESC}[0m`)
  assert.equal(isStyle('#4ec9d6'), true)
  assert.equal(isStyle('#fff'), true)
  assert.equal(isStyle('#nothex'), false)
})

test('a background color adds a bg code, named or hex', () => {
  assert.equal(paint('x', 'black', 'cyan'), `${ESC}[30;46mx${ESC}[0m`)
  assert.equal(paint('x', undefined, '#4ec9d6'), `${ESC}[48;2;78;201;214mx${ESC}[0m`)
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
