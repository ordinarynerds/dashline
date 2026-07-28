import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cost } from '../src/widgets/cost.ts'
import { scan } from '../src/scan.ts'
import type { Ctx, Needs, WidgetOpts } from '../src/widgets/types.ts'

const ctx = (over: Partial<Ctx> = {}): Ctx => ({
  payload: { cost: { total_cost_usd: 2.69 } },
  git: {},
  thresholds: { warning: 70, critical: 90, usageWarning: 70, usageCritical: 90 },
  now: 1000,
  ledger: { week: 41.8, month: 128.4 },
  ...over,
})

const needsOf = (opts: WidgetOpts): Needs => (typeof cost.needs === 'function' ? cost.needs(opts) : (cost.needs ?? {}))

test('the default period is the session, straight from the payload', () => {
  assert.deepEqual(cost.data(ctx(), {}), { kind: 'money', usd: 2.69 })
})

test('week and month read the ledger and name themselves', () => {
  assert.deepEqual(cost.data(ctx(), { period: 'week' }), { kind: 'money', usd: 41.8, label: 'week' })
  assert.deepEqual(cost.data(ctx(), { period: 'month' }), { kind: 'money', usd: 128.4, label: 'month' })
})

test('a variant drops the name, the way the usage widgets do', () => {
  assert.deepEqual(cost.data(ctx(), { period: 'week', variant: 'round' }), {
    kind: 'money',
    usd: 41.8,
    label: undefined,
  })
})

test('an unknown period falls back to the session rather than drawing nothing', () => {
  assert.deepEqual(cost.data(ctx(), { period: 'decade' }), { kind: 'money', usd: 2.69 })
})

test('only the cross-session periods ask for the ledger', () => {
  assert.deepEqual(needsOf({}), {})
  assert.deepEqual(needsOf({ period: 'session' }), {})
  assert.deepEqual(needsOf({ period: 'week' }), { ledger: true })
  assert.deepEqual(needsOf({ period: 'month' }), { ledger: true })
})

test('the widget hides when the period it was asked for has no ledger', () => {
  assert.equal(cost.data(ctx({ ledger: null }), { period: 'week' }), null)
  assert.equal(cost.data(ctx({ ledger: undefined }), { period: 'month' }), null)
})

test('session cost still draws when no ledger was gathered', () => {
  assert.deepEqual(cost.data(ctx({ ledger: undefined }), {}), { kind: 'money', usd: 2.69 })
})

test('scan gathers the ledger only for the items that need it', () => {
  assert.equal(scan([['cost']]).usesLedger, false)
  assert.equal(scan([[['cost', { period: 'week' }]]]).usesLedger, true)
  assert.equal(scan([[['cost', { period: 'month' }]]]).usesLedger, true)
  assert.equal(scan([[['cost', 'round']]]).usesLedger, false)
  // One item asking is enough for the whole line.
  assert.equal(scan([['cost', ['cost', { period: 'month' }]]]).usesLedger, true)
})
