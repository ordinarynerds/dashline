import type { Widget } from './types.ts'
import { named } from './usage.ts'

// What the week has cost, summed across sessions. `cost` answers the same question for the
// session in front of you; this is the one that says whether the week got away from you.
//
// Named for the same reason the plan-usage widgets are: "$41.80" beside "$2.69" is two sums of
// money with nothing to tell them apart.
export const spend: Widget = {
  needs: { ledger: true },
  data({ ledger }, opts) {
    if (ledger == null) return null
    return { kind: 'money', usd: ledger, label: named('week', opts.variant) }
  },
}
