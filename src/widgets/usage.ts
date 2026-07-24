import type { Ctx, Widget } from './types.ts'
import { paint } from '../style.ts'
import { countdown } from '../util/format.ts'

function usageColor(pct: number, { usageWarn, usageCrit }: Ctx['thresholds']): string {
  if (pct >= usageCrit) return 'red'
  if (pct >= usageWarn) return 'yellow'
  return 'green'
}

export const session: Widget = {
  render(ctx) {
    const w = ctx.payload.rate_limits?.five_hour
    if (w?.used_percentage == null) return null
    const pct = Math.round(w.used_percentage)
    let out = `${paint('session', 'dim')} ${paint(`${pct}%`, usageColor(pct, ctx.thresholds))}`
    if (w.resets_at) out += ` ${paint(`(↻${countdown(w.resets_at, ctx.now)})`, 'dim')}`
    return out
  },
}

export const weekly: Widget = {
  render(ctx) {
    const w = ctx.payload.rate_limits?.seven_day
    if (w?.used_percentage == null) return null
    const pct = Math.round(w.used_percentage)
    return `${paint('All', 'dim')} ${paint(`${pct}%`, usageColor(pct, ctx.thresholds))}`
  },
}
