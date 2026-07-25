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

test('the status probe is only requested by widgets that read working-tree state', () => {
  assert.equal(scan([['branch', 'model']]).gitNeeds.status, undefined)
  assert.equal(scan([['worktree']]).gitNeeds.status, undefined)
  assert.equal(scan([['dirty']]).gitNeeds.status, true)
  assert.equal(scan([['sync']]).gitNeeds.status, true)
  assert.equal(scan([['stash']]).gitNeeds.status, true)
})

test('sha asks for the head, not the working tree', () => {
  assert.equal(scan([['sha']]).gitNeeds.sha, true)
  assert.equal(scan([['sha']]).gitNeeds.status, undefined)
  // Both are still reported when both are configured; readGit is what knows the porcelain
  // read already carries the sha, so scan does not have to model the cost of a probe.
  assert.deepEqual(scan([['sha', 'dirty']]).gitNeeds, { sha: true, status: true })
})

test('a widget that needs no probe contributes nothing', () => {
  assert.deepEqual(scan([['model', 'cost', 'time', 'host']]).gitNeeds, {})
  assert.equal(scan([['model']]).usesGit, false)
})

test('diff and worktree are gated independently of status', () => {
  assert.equal(scan([['diff']]).gitNeeds.diff, true)
  assert.equal(scan([['dirty']]).gitNeeds.diff, undefined)
  assert.equal(scan([['worktree']]).gitNeeds.worktree, true)
  assert.equal(scan([['dirty']]).gitNeeds.worktree, undefined)
})

test('a config with no git widget asks for no probe at all', () => {
  assert.deepEqual(scan([['model', 'context']]).gitNeeds, {})
})

test('a command needs the worktree but not the working-tree state', () => {
  const { gitNeeds } = scan([['my-tool']])
  assert.equal(gitNeeds.worktree, true)
  assert.equal(gitNeeds.status, undefined)
})
