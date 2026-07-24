import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runCommand } from '../src/widgets/command.ts'
import type { Ctx } from '../src/widgets/types.ts'

const ctx: Ctx = {
  payload: { workspace: { current_dir: '/tmp/here' } },
  git: { branch: 'main', worktree: 'hotfix' },
  thresholds: { warning: 40, critical: 50, usageWarning: 70, usageCritical: 90 },
  now: 0,
}

test('returns the first non-empty output line', async () => {
  assert.equal(await runCommand('printf "\\n  \\nhello\\nworld"', ctx), 'hello')
})

test('dynamic values arrive through the environment, not the command text', async () => {
  assert.equal(await runCommand('echo "$DASHLINE_BRANCH-$DASHLINE_WORKTREE"', ctx), 'main-hotfix')
})

test('a branch that looks like a shell expression cannot inject', async () => {
  const hostile: Ctx = { ...ctx, git: { branch: '$(touch /tmp/dashline-pwned)' } }
  assert.equal(await runCommand('echo "$DASHLINE_BRANCH"', hostile), '$(touch /tmp/dashline-pwned)')
})

test('a command that outruns the timeout resolves to null', async () => {
  assert.equal(await runCommand('sleep 5', ctx), null)
})

test('a failing command resolves to null', async () => {
  assert.equal(await runCommand('exit 1', ctx), null)
})
