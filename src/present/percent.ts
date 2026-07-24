import type { Percent } from '../datum.ts'
import type { Ctx, WidgetOpts } from '../widgets/types.ts'
import { paint } from '../style.ts'
import { bar } from '../util/bar.ts'
import { human, countdown } from '../util/format.ts'

const WIDTH = 10

export function percent(d: Percent, opts: WidgetOpts, ctx: Ctx): string {
  const color = opts.color ?? fillColor(d, ctx)
  const number = paint(`${Math.round(d.value)}%`, `bold ${color}`)
  const meter = paint(bar(d.value, WIDTH, opts.bar), color)

  switch (opts.variant) {
    case 'pct':
      return number
    case 'bar':
      return meter
    case 'gauge':
      return paint(`▕${bar(d.value, WIDTH, opts.bar)}▏`, color)
    case 'ratio':
      return d.tokens ? paint(`${human(d.tokens.used)}/${human(d.tokens.size)}`, color) : number
    case 'tokens':
      return d.tokens ? paint(`(${human(d.tokens.used)}/${human(d.tokens.size)})`, 'dim') : number
  }

  const parts: string[] = []
  if (d.label) parts.push(paint(d.label, 'dim'))
  parts.push(number)
  if (d.defaultBar) parts.push(meter)
  if (d.tokens) parts.push(paint(`(${human(d.tokens.used)}/${human(d.tokens.size)})`, 'dim'))
  if (d.hint && d.value >= ctx.thresholds.compact) {
    parts.push(`${paint('→ /compact', 'bold red')} ${paint('[next goal/task]', 'dim')}`)
  } else if (d.hint && d.value >= ctx.thresholds.warn) {
    parts.push(paint('· high', 'yellow'))
  }
  if (d.reset) parts.push(paint(`(↻${countdown(d.reset, ctx.now)})`, 'dim'))
  return parts.join(' ')
}

function fillColor(d: Percent, ctx: Ctx): string {
  const t = ctx.thresholds
  if (d.scale === 'context') return d.value >= t.compact ? 'red' : d.value >= t.warn ? 'yellow' : 'green'
  return d.value >= t.usageCrit ? 'red' : d.value >= t.usageWarn ? 'yellow' : 'green'
}
