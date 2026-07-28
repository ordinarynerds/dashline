import type { Widget, WidgetOpts } from './types.ts'
import { named } from './usage.ts'

// What it has cost. `period` chooses the window: the session in front of you by default, or the
// week or the month across every session, which is the number that says whether it got away
// from you.
//
// One widget rather than three because they differ only in which window they sum — same money,
// same presentation, same `cents` and `round` variants. `period` is its own option rather than a
// variant so it composes with those: a rounded monthly total is `{ period: month, variant: round }`.
export const PERIODS = ['session', 'week', 'month'] as const
export type Period = (typeof PERIODS)[number]

export function periodOf(opts: WidgetOpts): Period {
  return opts.period === 'week' || opts.period === 'month' ? opts.period : 'session'
}

export const cost: Widget = {
  // Only the cross-session windows need the ledger read; the session total is already in the
  // payload. Declared as a function so a line showing plain session cost pays nothing for a
  // window it never asked for.
  needs: (opts) => (periodOf(opts) === 'session' ? {} : { ledger: true }),
  data({ payload, ledger }, opts) {
    const period = periodOf(opts)
    if (period === 'session') {
      const usd = payload.cost?.total_cost_usd
      return usd == null ? null : { kind: 'money', usd }
    }
    const usd = ledger?.[period]
    // Named for the same reason the plan-usage widgets are: "$41.80" beside "$2.69" is two sums
    // of money with nothing to tell them apart.
    return usd == null ? null : { kind: 'money', usd, label: named(period, opts.variant) }
  },
}
