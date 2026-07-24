import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scan } from '../src/scan.ts'

test('collects command items and dedupes them', () => {
  const { commands } = scan([['branch', 'my-tool a', 'model'], { right: ['my-tool a', 'other cmd'] }])
  assert.deepEqual(commands.sort(), ['my-tool a', 'other cmd'])
})

test('usesGit only when branch, worktree, or a command is present', () => {
  assert.equal(scan([['model', 'context']]).usesGit, false)
  assert.equal(scan([['branch']]).usesGit, true)
  assert.equal(scan([{ right: ['worktree'] }]).usesGit, true)
  assert.equal(scan([['some command']]).usesGit, true)
})

test('text items are neither commands nor a git trigger', () => {
  const { commands, usesGit } = scan([[{ text: 'hi' }, 'model']])
  assert.deepEqual(commands, [])
  assert.equal(usesGit, false)
})

test('usesHistory for the burn widget, the history variant, and the trend option', () => {
  assert.equal(scan([['model', 'context']]).usesHistory, false)
  assert.equal(scan([['burn']]).usesHistory, true)
  assert.equal(scan([[['context', 'history']]]).usesHistory, true)
  assert.equal(scan([[['context', { variant: 'history' }]]]).usesHistory, true)
  assert.equal(scan([[['context', { trend: true }]]]).usesHistory, true)
})
