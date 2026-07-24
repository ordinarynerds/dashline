import { test } from 'node:test'
import assert from 'node:assert/strict'
import { render } from '../src/render.ts'
import { strip } from '../src/util/width.ts'
import type { DashlineConfig, LineSpec } from '../src/config.ts'
import type { Ctx } from '../src/widgets/types.ts'
import type { Payload } from '../src/payload.ts'

const base: Omit<DashlineConfig, 'lines'> = {
  separator: '·',
  margin: 5,
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
  assert.match(render({ ...base, lines: [[{ text: 'hi', color: 'red' }]] }, ctx({}), 120)[0]!, /1;31m/)
  assert.deepEqual(run([[{ text: '' }]], ctx({})), [])
})

test('control characters in a text item and the separator are neutralized', () => {
  const ESC = String.fromCharCode(27)
  const BEL = String.fromCharCode(7)
  const c = ctx({})
  const out = render({ ...base, separator: `${ESC};`, lines: [[{ text: `a${ESC}]0;x${BEL}b` }, { text: 'c' }]] }, c, 120)
  assert.equal(strip(out[0]!), 'a]0;xb ; c')
  assert.ok(!strip(out[0]!).includes(ESC))
})
