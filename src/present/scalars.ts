import type { Duration, Money, Delta, Flag } from '../datum.ts'
import type { WidgetOpts } from '../widgets/types.ts'
import { paint, styleTerm } from '../style.ts'
import { duration as short, hms } from '../util/format.ts'

export function duration(d: Duration, opts: WidgetOpts): string {
  const term = styleTerm(opts.color ?? 'dim', opts)
  const { h, m, s } = hms(d.ms)
  if (opts.variant === 'long') return paint(`${h}h${String(m).padStart(2, '0')}m`, term)
  if (opts.variant === 'clock') {
    return paint(`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, term)
  }
  return paint(short(d.ms), term)
}

export function money(d: Money, opts: WidgetOpts): string {
  const term = styleTerm(opts.color ?? 'green', opts)
  const tail = d.suffix ?? ''
  if (opts.variant === 'cents') return paint(`${Math.round(d.usd * 100)}c${tail}`, term)
  if (opts.variant === 'round') return paint(`$${Math.round(d.usd)}${tail}`, term)
  return paint(`$${d.usd.toFixed(2)}${tail}`, term)
}

export function delta(d: Delta, opts: WidgetOpts): string {
  if (opts.variant === 'added') return paint(`+${d.added}`, styleTerm(opts.color ?? 'green', opts))
  if (opts.variant === 'sum') {
    const net = d.added - d.removed
    return paint(`${net >= 0 ? '+' : ''}${net}`, styleTerm(opts.color ?? (net >= 0 ? 'green' : 'red'), opts))
  }
  if (opts.color) return paint(`+${d.added} -${d.removed}`, styleTerm(opts.color, opts))
  return `${paint(`+${d.added}`, styleTerm('green', opts))} ${paint(`-${d.removed}`, styleTerm('red', opts))}`
}

export function flag(d: Flag, opts: WidgetOpts): string | null {
  if (opts.variant === 'onoff') return paint(`${d.text}:${d.on ? 'on' : 'off'}`, styleTerm(opts.color ?? (d.on ? 'green' : 'dim'), opts))
  return d.on ? paint(d.text, styleTerm(opts.color ?? 'yellow', opts)) : null
}
