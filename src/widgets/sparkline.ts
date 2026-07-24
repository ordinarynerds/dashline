import type { Widget } from './types.ts'
import { spark } from '../util/format.ts'

export const sparkline: Widget = {
  data(ctx) {
    const values = (ctx.history ?? []).filter((s) => s.ctx != null).map((s) => s.ctx!)
    if (values.length < 2) return null
    const recent = values.slice(-20)
    const last = recent[recent.length - 1]!
    const t = ctx.thresholds
    const color = last >= t.critical ? 'red' : last >= t.warning ? 'yellow' : 'green'
    return { kind: 'label', text: spark(recent), color }
  },
}
