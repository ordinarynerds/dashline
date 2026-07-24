import type { Ctx, Widget } from './types.ts'
import { paint } from '../style.ts'
import { human } from '../util/format.ts'

const WIDTH = 10

export const context: Widget = {
  render(ctx, opts) {
    const c = ctx.payload.context_window
    const pct = percent(ctx)
    if (pct === null) return paint('--', 'dim')

    const color = pct >= ctx.thresholds.compact ? 'red' : pct >= ctx.thresholds.warn ? 'yellow' : 'green'
    const variant = opts.variant ?? 'full'

    const number = paint(`${pct}%`, `bold ${color}`)
    const bar = paint('█'.repeat(fill(pct)) + '░'.repeat(WIDTH - fill(pct)), color)
    const tokens = tokenLabel(c)

    if (variant === 'pct') return number
    if (variant === 'bar') return bar
    if (variant === 'tokens') return tokens ?? number

    let hint = ''
    if (pct >= ctx.thresholds.compact) hint = ` ${paint('→ /compact', 'bold red')} ${paint('[next goal/task]', 'dim')}`
    else if (pct >= ctx.thresholds.warn) hint = ` ${paint('· high', 'yellow')}`

    return `${number} ${bar}${tokens ? ` ${tokens}` : ''}${hint}`
  },
}

function fill(pct: number): number {
  return Math.min(WIDTH, Math.max(0, Math.round((pct * WIDTH) / 100)))
}

function tokenLabel(c: Ctx['payload']['context_window']): string | null {
  const used = c?.total_input_tokens ?? c?.current_usage?.input_tokens
  const size = c?.context_window_size
  if (used == null || size == null) return null
  return paint(`(${human(used)}/${human(size)})`, 'dim')
}

function percent(ctx: Ctx): number | null {
  const c = ctx.payload.context_window
  if (!c) return null
  if (typeof c.used_percentage === 'number') return Math.round(c.used_percentage)
  const used = c.total_input_tokens ?? c.current_usage?.input_tokens
  if (used != null && c.context_window_size) return Math.round((used / c.context_window_size) * 100)
  return null
}
