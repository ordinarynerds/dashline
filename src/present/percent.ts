import type { Percent } from '../datum.ts'
import type { Ctx, WidgetOpts } from '../widgets/types.ts'
import { paint } from '../style.ts'
import { bar } from '../util/bar.ts'
import { human, countdown } from '../util/format.ts'

const DEFAULT_WIDTH = 10

export function percent(d: Percent, opts: WidgetOpts, ctx: Ctx): string {
  const color = opts.color ?? fillColor(d, opts, ctx)
  const width = opts.width ?? DEFAULT_WIDTH
  const number = paint(`${Math.round(d.value)}%`, `bold ${color}`)
  const meter = paint(bar(d.value, width, opts.bar), color)

  switch (opts.variant) {
    case 'pct':
      return number
    case 'bar':
      return meter
    case 'gauge':
      return paint(`▕${bar(d.value, width, opts.bar)}▏`, color)
    case 'ratio':
      return d.tokens ? paint(`${human(d.tokens.used)}/${human(d.tokens.size)}`, color) : number
    case 'tokens':
      return d.tokens ? paint(`(${human(d.tokens.used)}/${human(d.tokens.size)})`, 'dim') : number
  }

  const label = opts.label ?? d.label
  const parts: string[] = []
  if (label) parts.push(paint(label, 'dim'))
  parts.push(number)
  if (d.defaultBar || opts.bar) parts.push(meter)
  if (d.tokens) parts.push(paint(`(${human(d.tokens.used)}/${human(d.tokens.size)})`, 'dim'))
  if (d.hint && d.value >= ctx.thresholds.compact) {
    parts.push(`${paint('→ /compact', 'bold red')} ${paint('[next goal/task]', 'dim')}`)
  } else if (d.hint && d.value >= ctx.thresholds.warn) {
    parts.push(paint('· high', 'yellow'))
  }
  if (d.reset && opts.countdown !== false) parts.push(paint(`(↻${countdown(d.reset, ctx.now)})`, 'dim'))
  return parts.join(' ')
}

function fillColor(d: Percent, opts: WidgetOpts, ctx: Ctx): string {
  const t = ctx.thresholds
  const warn = opts.warn ?? (d.scale === 'context' ? t.warn : t.usageWarn)
  const crit = opts.crit ?? (d.scale === 'context' ? t.compact : t.usageCrit)
  return d.value >= crit ? 'red' : d.value >= warn ? 'yellow' : 'green'
}
