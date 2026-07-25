import { test } from 'node:test'
import assert from 'node:assert/strict'
import { render } from '../src/render.ts'
import { setTheme } from '../src/style.ts'
import { strip } from '../src/util/width.ts'
import type { DashlineConfig, LineSpec } from '../src/config.ts'
import type { Ctx } from '../src/widgets/types.ts'
import type { Payload } from '../src/payload.ts'
import type { GitInfo } from '../src/util/git.ts'

const base: Omit<DashlineConfig, 'lines'> = {
  separator: '·',
  margin: 5,
  powerline: false,
  theme: '',
  icons: false,
  contextWarningAt: 40,
  contextCriticalAt: 50,
  usageWarningAt: 70,
  usageCriticalAt: 90,
}

function ctx(payload: Payload, branch?: string): Ctx {
  return {
    payload,
    git: branch ? { branch } : {},
    thresholds: { warning: 40, critical: 50, usageWarning: 70, usageCritical: 90 },
    now: 1_000_000,
  }
}

function run(lines: LineSpec[], c: Ctx, columns = 120): string[] {
  return render({ ...base, lines }, c, columns).map(strip)
}

const full: Payload = {
  model: { display_name: 'Opus 4.8 (1M context)' },
  context_window: { used_percentage: 44, total_input_tokens: 440000, context_window_size: 1000000 },
  cost: { total_cost_usd: 2.69 },
  session_name: 'celestial-vega',
  output_style: { name: 'rc' },
  pr: { number: 702 },
  rate_limits: {
    five_hour: { used_percentage: 61, resets_at: 1_007_860 },
    seven_day: { used_percentage: 74, resets_at: 1_320_000 },
  },
}

test('default-style line: branch, model, context, session, weekly', () => {
  const [line] = run([{ left: ['branch', 'model', 'context'], right: ['session', 'weekly'] }], ctx(full, 'main'))
  assert.match(line!, /⎇ main · Opus 4\.8 · 44% ████░░░░░░ \(440k\/1\.0M\) · high/)
  assert.match(line!, /session 61% \(↻2h11m\) · All 74%/)
})

test('context variant "pct" shows only the percentage', () => {
  assert.deepEqual(run([[['context', 'pct']]], ctx(full)), ['44%'])
})

test('context variant "bar" shows only the bar', () => {
  assert.deepEqual(run([[['context', 'bar']]], ctx(full)), ['████░░░░░░'])
})

test('context variant "tokens" shows only the token count', () => {
  assert.deepEqual(run([[['context', 'tokens']]], ctx(full)), ['(440k/1.0M)'])
})

test('a bare array is a left-aligned line', () => {
  assert.deepEqual(run([['cost', 'pr']], ctx(full)), ['$2.69 · PR #702'])
})

test('an unknown token is drawn from the resolved command map', () => {
  const c = ctx(full)
  c.commands = new Map([['my-tool status', 'branch clean']])
  assert.deepEqual(run([['my-tool status']], c), ['branch clean'])
})

test('each entry in lines is one row', () => {
  const rows = run([['model'], ['cost'], ['pr']], ctx(full))
  assert.deepEqual(rows, ['Opus 4.8', '$2.69', 'PR #702'])
})

test('missing data drops the item, and an empty line is skipped', () => {
  assert.deepEqual(run([['pr'], ['cost']], ctx({})), [])
})

test('null context renders --', () => {
  assert.deepEqual(run([['context']], ctx({ context_window: undefined })), ['--'])
})

test('session_name and output_style widgets', () => {
  assert.deepEqual(run([['name', 'output']], ctx(full)), ['celestial-vega · /rc'])
})

test('name with the id option appends the short session id', () => {
  const p: Payload = { session_name: 'celestial-vega', session_id: 'abcd1234-0000-0000' }
  assert.deepEqual(run([[['name', { id: true }]]], ctx(p)), ['celestial-vega-abcd1234'])
})

test('cost-derived widgets: duration and lines', () => {
  const p: Payload = {
    cost: { total_cost_usd: 2.69, total_duration_ms: 2_220_000, total_lines_added: 156, total_lines_removed: 23 },
  }
  assert.deepEqual(run([['duration']], ctx(p)), ['37m'])
  assert.deepEqual(run([['lines']], ctx(p)), ['+156 -23'])
})

test('repo widget, name by default and owner/name in the full variant', () => {
  const p: Payload = { workspace: { repo: { owner: 'ordinarynerds', name: 'dashline' } } }
  assert.deepEqual(run([['repo']], ctx(p)), ['dashline'])
  assert.deepEqual(run([[['repo', 'full']]], ctx(p)), ['ordinarynerds/dashline'])
})

test('review formats the PR state', () => {
  assert.deepEqual(run([['review']], ctx({ pr: { review_state: 'changes_requested' } })), ['changes requested'])
})

test('flag widgets appear only when their flag is on', () => {
  assert.deepEqual(run([['fast', 'thinking']], ctx({})), [])
  assert.deepEqual(run([['fast']], ctx({ fast_mode: true })), ['fast'])
})

// The presentation set attaches to the data type, so a variant works on any widget
// of that type, not just the one it was first written for.
test('percent presentations work on session and weekly, not just context', () => {
  assert.deepEqual(run([[['session', 'bar']]], ctx(full)), ['██████░░░░'])
  assert.deepEqual(run([[['weekly', 'pct']]], ctx(full)), ['74%'])
  assert.deepEqual(run([[['session', 'gauge']]], ctx(full)), ['▕██████░░░░▏'])
})

test('duration presentations: short and clock', () => {
  const p: Payload = { cost: { total_duration_ms: 2_220_000 } }
  assert.deepEqual(run([['duration']], ctx(p)), ['37m'])
  assert.deepEqual(run([[['duration', 'clock']]], ctx(p)), ['0:37:00'])
})

test('money presentation: cents', () => {
  assert.deepEqual(run([[['cost', 'cents']]], ctx(full)), ['269c'])
})

test('delta presentation: sum', () => {
  const p: Payload = { cost: { total_lines_added: 156, total_lines_removed: 23 } }
  assert.deepEqual(run([[['lines', 'sum']]], ctx(p)), ['+133'])
})

test('label presentations: basename and truncate', () => {
  const p: Payload = { workspace: { current_dir: '/Users/me/Development/dashline' } }
  assert.deepEqual(run([[['cwd', 'basename']]], ctx(p)), ['dashline'])
  assert.deepEqual(run([[['cwd', 'truncate:6']]], ctx(p)), ['/User…'])
})

test('flag presentation: onoff shows even when off', () => {
  assert.deepEqual(run([[['fast', 'onoff']]], ctx({})), ['fast:off'])
})

test('a { text } item renders literal text alongside widgets', () => {
  assert.deepEqual(run([[{ text: 'hello' }, 'model']], ctx({ model: { display_name: 'Opus 4.8' } })), ['hello · Opus 4.8'])
})

test('a { text } item takes a color and an empty one is dropped', () => {
  assert.match(render({ ...base, lines: [[{ text: 'hi', color: 'red' }]] }, ctx({}), 120)[0]!, /\[31m/)
  assert.deepEqual(run([[{ text: '' }]], ctx({})), [])
})

test('an absurd bar width renders a bounded line rather than crashing or blanking', () => {
  const out = run([[['context', { variant: 'bar', width: 100000000 }]]], ctx(full))
  assert.equal(out.length, 1)
  assert.ok(out[0]!.length > 0)
})

test('trend appends a direction arrow to context, read from history', () => {
  const c = ctx(full) // context is 44%
  c.history = [
    { t: 0, ctx: 10, cost: null },
    { t: 5, ctx: 20, cost: null },
    { t: 10, ctx: 30, cost: null },
  ]
  assert.match(run([[['context', { trend: true }]]], c)[0]!, /↑/)
})

test('icons: true adds a default glyph to label widgets', () => {
  const branchIcon = String.fromCodePoint(0xe0a0)
  const out = render({ ...base, icons: true, lines: [['branch']] }, ctx(full, 'main'), 80)
  assert.ok(strip(out[0]!).includes(branchIcon))
})

test('theme recolors named widget colors', () => {
  // nord cyan is #88C0D0 -> 136;192;208; branch defaults to cyan
  setTheme('nord')
  try {
    const out = render({ ...base, theme: 'nord', lines: [['branch']] }, ctx(full, 'main'), 80)
    assert.match(out[0]!, /38;2;136;192;208/)
  } finally {
    setTheme(undefined)
  }
})

test('the context history variant draws a block graph from history', () => {
  const c = ctx(full)
  c.history = [
    { t: 0, ctx: 10, cost: null },
    { t: 5, ctx: 50, cost: null },
    { t: 10, ctx: 90, cost: null },
  ]
  const out = run([[['context', 'history']]], c)
  assert.equal(out.length, 1)
  assert.match(out[0]!, /[▁▂▃▄▅▆▇█]/)
})

test('burn projects toward compact when context is climbing, and hides when flat', () => {
  const climbing = ctx({})
  climbing.history = [
    { t: 0, ctx: 10, cost: null },
    { t: 15, ctx: 25, cost: null },
    { t: 30, ctx: 40, cost: null },
  ]
  assert.match(run([['burn']], climbing)[0]!, /→ \/compact ~/)

  const flat = ctx({})
  flat.history = [
    { t: 0, ctx: 40, cost: null },
    { t: 15, ctx: 40, cost: null },
    { t: 30, ctx: 40, cost: null },
  ]
  assert.deepEqual(run([['burn']], flat), [])
})

test('powerline mode wraps zone items in arrow-joined segments', () => {
  const arrow = String.fromCodePoint(0xe0b0)
  const out = render({ ...base, powerline: true, lines: [['model', 'name']] }, ctx({ model: { display_name: 'Opus' }, session_name: 'vega' }), 80)
  const bare = strip(out[0]!)
  assert.ok(bare.includes(arrow))
  assert.ok(bare.includes(' Opus '))
  assert.ok(bare.includes(' vega '))
})

test('a text item and a widget label can take a background color', () => {
  // magenta background = SGR 45
  assert.match(render({ ...base, lines: [[{ text: 'PR', color: 'black', bg: 'magenta' }]] }, ctx({}), 120)[0]!, /45m/)
  // blue background = SGR 44 on a widget label
  assert.match(render({ ...base, lines: [[['model', { bg: 'blue' }]]] }, ctx({ model: { display_name: 'Opus' } }), 120)[0]!, /44m/)
})

test('control characters in a text item and the separator are neutralized', () => {
  const ESC = String.fromCharCode(27)
  const BEL = String.fromCharCode(7)
  const c = ctx({})
  const out = render({ ...base, separator: `${ESC};`, lines: [[{ text: `a${ESC}]0;x${BEL}b` }, { text: 'c' }]] }, c, 120)
  assert.equal(strip(out[0]!), 'a]0;xb ; c')
  assert.ok(!strip(out[0]!).includes(ESC))
})

// --- git working-tree widgets -------------------------------------------------------

function gitCtx(git: GitInfo): Ctx {
  return {
    payload: {},
    git,
    thresholds: { warning: 40, critical: 50, usageWarning: 70, usageCritical: 90 },
    now: 1_000_000,
  }
}

const messy: GitInfo = { staged: 2, unstaged: 3, untracked: 1, conflicts: 0, stash: 4, ahead: 2, behind: 3, sha: 'a1b2c3d' }
const tidy: GitInfo = { staged: 0, unstaged: 0, untracked: 0, conflicts: 0, stash: 0 }

test('dirty counts each part, and each part is its own variant', () => {
  assert.deepEqual(run([['dirty']], gitCtx(messy)), ['+2 *3 ?1'])
  assert.deepEqual(run([[['dirty', 'flags']]], gitCtx(messy)), ['+*?'])
  assert.deepEqual(run([[['dirty', 'staged']]], gitCtx(messy)), ['+2'])
  assert.deepEqual(run([[['dirty', 'unstaged']]], gitCtx(messy)), ['*3'])
  assert.deepEqual(run([[['dirty', 'untracked']]], gitCtx(messy)), ['?1'])
})

test('dirty hides on a clean tree, and the clean variant hides on a dirty one', () => {
  assert.deepEqual(run([['dirty']], gitCtx(tidy)), [])
  assert.deepEqual(run([[['dirty', 'clean']]], gitCtx(tidy)), ['✓'])
  assert.deepEqual(run([[['dirty', 'clean']]], gitCtx(messy)), [])
  assert.deepEqual(run([[['dirty', 'staged']]], gitCtx(tidy)), [])
})

test('dirty hides entirely when status was never probed', () => {
  assert.deepEqual(run([['dirty']], gitCtx({ branch: 'main' })), [])
  assert.deepEqual(run([[['dirty', 'clean']]], gitCtx({ branch: 'main' })), [])
})

test('conflicts are counted and turn the whole reading red', () => {
  assert.deepEqual(run([['dirty']], gitCtx({ ...tidy, conflicts: 2 })), ['!2'])
  assert.match(render({ ...base, lines: [['dirty']] }, gitCtx({ ...tidy, conflicts: 2 }), 120)[0]!, /31m/)
})

test('sync reads ahead and behind, and hides when level', () => {
  assert.deepEqual(run([['sync']], gitCtx(messy)), ['↑2↓3'])
  assert.deepEqual(run([[['sync', 'ahead']]], gitCtx(messy)), ['↑2'])
  assert.deepEqual(run([[['sync', 'behind']]], gitCtx(messy)), ['↓3'])
  assert.deepEqual(run([['sync']], gitCtx({ ahead: 0, behind: 0 })), [])
  assert.deepEqual(run([[['sync', 'synced']]], gitCtx({ ahead: 0, behind: 0 })), ['≡'])
})

test('sync hides when the branch has no upstream', () => {
  assert.deepEqual(run([['sync']], gitCtx({ branch: 'solo' })), [])
  assert.deepEqual(run([[['sync', 'synced']]], gitCtx({ branch: 'solo' })), [])
})

test('sha and stash', () => {
  assert.deepEqual(run([['sha']], gitCtx(messy)), ['a1b2c3d'])
  assert.deepEqual(run([['sha']], gitCtx({})), [])
  assert.deepEqual(run([['stash']], gitCtx(messy)), ['⚑4'])
  assert.deepEqual(run([['stash']], gitCtx(tidy)), [])
})

test('diff reuses the delta presentations and hides a clean tree', () => {
  assert.deepEqual(run([['diff']], gitCtx({ added: 42, removed: 10 })), ['+42 -10'])
  assert.deepEqual(run([[['diff', 'sum']]], gitCtx({ added: 42, removed: 10 })), ['+32'])
  assert.deepEqual(run([[['diff', 'added']]], gitCtx({ added: 42, removed: 10 })), ['+42'])
  assert.deepEqual(run([['diff']], gitCtx({ added: 0, removed: 0 })), [])
  assert.deepEqual(run([['diff']], gitCtx({})), [])
})

// --- payload widgets added alongside the git batch -----------------------------------

test('weekly now shows its reset countdown, which the payload always carried', () => {
  // seven_day.resets_at was parsed and then dropped; session showed one and weekly did not.
  assert.deepEqual(run([['weekly']], ctx(full)), ['All 74% (↻3d16h)'])
  assert.deepEqual(run([[['weekly', { countdown: false }]]], ctx(full)), ['All 74%'])
})

test('weekly hides the countdown when the payload has no reset', () => {
  const noReset = { rate_limits: { seven_day: { used_percentage: 74 } } }
  assert.deepEqual(run([['weekly']], ctx(noReset)), ['All 74%'])
})

test('model trims the context parenthetical by default and keeps it under "full"', () => {
  assert.deepEqual(run([['model']], ctx(full)), ['Opus 4.8'])
  assert.deepEqual(run([[['model', 'full']]], ctx(full)), ['Opus 4.8 (1M context)'])
  assert.deepEqual(run([[['model', 'id']]], ctx({ model: { id: 'claude-opus-5' } })), ['claude-opus-5'])
  assert.deepEqual(run([[['model', 'id']]], ctx(full)), [])
})

test('name takes a standalone id variant', () => {
  const p = { session_name: 'celestial-vega', session_id: 'abcdef1234567890' }
  assert.deepEqual(run([['name']], ctx(p)), ['celestial-vega'])
  assert.deepEqual(run([[['name', { id: true }]]], ctx(p)), ['celestial-vega-abcdef12'])
  assert.deepEqual(run([[['name', 'id']]], ctx(p)), ['abcdef12'])
  assert.deepEqual(run([[['name', 'id']]], ctx({ session_name: 'x' })), [])
})

test('repo reads the owner and host separately', () => {
  const p = { workspace: { repo: { host: 'github.com', owner: 'ordinarynerds', name: 'dashline' } } }
  assert.deepEqual(run([['repo']], ctx(p)), ['dashline'])
  assert.deepEqual(run([[['repo', 'full']]], ctx(p)), ['ordinarynerds/dashline'])
  assert.deepEqual(run([[['repo', 'owner']]], ctx(p)), ['ordinarynerds'])
  assert.deepEqual(run([[['repo', 'host']]], ctx(p)), ['github.com'])
  assert.deepEqual(run([[['repo', 'owner']]], ctx({ workspace: { repo: { name: 'solo' } } })), [])
})

test('context "left" shows headroom instead of fill', () => {
  assert.deepEqual(run([[['context', 'left']]], ctx(full)), ['560k left'])
})

test('rate divides cost by duration and needs a minute of wall clock first', () => {
  const hour = { cost: { total_cost_usd: 4.5, total_duration_ms: 3_600_000 } }
  assert.deepEqual(run([['rate']], ctx(hour)), ['$4.50/h'])
  assert.deepEqual(run([[['rate', 'round']]], ctx(hour)), ['$5/h'])
  // Half an hour at the same spend is twice the rate.
  assert.deepEqual(run([['rate']], ctx({ cost: { total_cost_usd: 4.5, total_duration_ms: 1_800_000 } })), ['$9.00/h'])
  // Too early to mean anything.
  assert.deepEqual(run([['rate']], ctx({ cost: { total_cost_usd: 0.4, total_duration_ms: 5_000 } })), [])
  assert.deepEqual(run([['rate']], ctx({ cost: { total_cost_usd: 4.5 } })), [])
})

test('time renders the clock at the moment of the render', () => {
  // Local time depends on the runner's zone, so the shape is what matters.
  assert.match(run([['time']], ctx({}))[0]!, /^\d{2}:\d{2}$/)
  assert.match(run([[['time', 'seconds']]], ctx({}))[0]!, /^\d{2}:\d{2}:\d{2}$/)
  assert.match(run([[['time', 'hm12']]], ctx({}))[0]!, /^\d{1,2}:\d{2}(am|pm)$/)
})

test('host names the machine, and the ssh variant only when the session is remote', () => {
  assert.match(run([['host']], ctx({}))[0]!, /\S/)
  const wasSsh = process.env.SSH_TTY
  delete process.env.SSH_TTY
  const wasConn = process.env.SSH_CONNECTION
  delete process.env.SSH_CONNECTION
  assert.deepEqual(run([[['host', 'ssh']]], ctx({})), [])
  process.env.SSH_TTY = '/dev/ttys001'
  assert.match(run([[['host', 'ssh']]], ctx({}))[0]!, /\S/)
  if (wasSsh === undefined) delete process.env.SSH_TTY
  else process.env.SSH_TTY = wasSsh
  if (wasConn !== undefined) process.env.SSH_CONNECTION = wasConn
})
