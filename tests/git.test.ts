import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseStatus } from '../src/util/git.ts'

// Real `git status --porcelain=v2 --branch --show-stash --no-renames` output.
const clean = `# branch.oid dbc1fc7babeff3875e89ede2d9737ab54547a11c
# branch.head main
# branch.upstream origin/main
# branch.ab +0 -0`

test('reads the branch header of a clean tree', () => {
  const g = parseStatus(clean)
  assert.equal(g.branch, 'main')
  assert.equal(g.sha, 'dbc1fc7')
  assert.equal(g.ahead, 0)
  assert.equal(g.behind, 0)
  assert.deepEqual([g.staged, g.unstaged, g.untracked, g.conflicts, g.stash], [0, 0, 0, 0, 0])
})

test('counts each porcelain entry type', () => {
  const g = parseStatus(`${clean}
1 M. N... 100644 100644 100644 aaa bbb staged.ts
1 .M N... 100644 100644 100644 aaa bbb edited.ts
1 MM N... 100644 100644 100644 aaa bbb both.ts
u UU N... 100644 100644 100644 100644 aaa bbb ccc conflict.ts
? new.ts
? other.ts
! ignored.ts`)
  // both.ts is staged and edited again, so it counts once on each side.
  assert.equal(g.staged, 2)
  assert.equal(g.unstaged, 2)
  assert.equal(g.untracked, 2)
  assert.equal(g.conflicts, 1)
})

test('ignored entries are not counted as untracked', () => {
  assert.equal(parseStatus(`${clean}\n! build/out.js`).untracked, 0)
})

test('a detached head reads as its short sha', () => {
  const g = parseStatus(`# branch.oid ea6ebd403e138e4d60052d2138c7a296c7dffa08
# branch.head (detached)
# stash 2`)
  assert.equal(g.branch, 'ea6ebd4')
  assert.equal(g.sha, 'ea6ebd4')
  assert.equal(g.stash, 2)
})

test('no upstream leaves ahead and behind unset rather than zero', () => {
  const g = parseStatus(`# branch.oid dbc1fc7babeff3875e89ede2d9737ab54547a11c
# branch.head solo`)
  assert.equal(g.ahead, undefined)
  assert.equal(g.behind, undefined)
})

test('ahead and behind are read independently', () => {
  const g = parseStatus(`${clean.replace('+0 -0', '+2 -3')}`)
  assert.equal(g.ahead, 2)
  assert.equal(g.behind, 3)
})

test('a repo with no commits has no sha', () => {
  const g = parseStatus(`# branch.oid (initial)
# branch.head main`)
  assert.equal(g.sha, undefined)
  assert.equal(g.branch, 'main')
})

test('an absent stash header reads as zero', () => {
  assert.equal(parseStatus(clean).stash, 0)
})
