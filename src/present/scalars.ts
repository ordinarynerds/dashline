import type { Duration, Money, Delta, Flag } from '../datum.ts'
import type { WidgetOpts } from '../widgets/types.ts'
import { paint } from '../style.ts'
import { duration as short, hms } from '../util/format.ts'

export function duration(d: Duration, opts: WidgetOpts): string {
  const color = opts.color ?? 'dim'
  const { h, m, s } = hms(d.ms)
  if (opts.variant === 'long') return paint(`${h}h${String(m).padStart(2, '0')}m`, color)
  if (opts.variant === 'clock') {
    return paint(`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, color)
  }
  return paint(short(d.ms), color)
}

export function money(d: Money, opts: WidgetOpts): string {
  const color = opts.color ?? 'green'
  if (opts.variant === 'cents') return paint(`${Math.round(d.usd * 100)}c`, color)
  if (opts.variant === 'round') return paint(`$${Math.round(d.usd)}`, color)
  return paint(`$${d.usd.toFixed(2)}`, color)
}

export function delta(d: Delta, opts: WidgetOpts): string {
  if (opts.variant === 'added') return paint(`+${d.added}`, opts.color ?? 'green')
  if (opts.variant === 'sum') {
    const net = d.added - d.removed
    return paint(`${net >= 0 ? '+' : ''}${net}`, opts.color ?? (net >= 0 ? 'green' : 'red'))
  }
  if (opts.color) return paint(`+${d.added} -${d.removed}`, opts.color)
  return `${paint(`+${d.added}`, 'green')} ${paint(`-${d.removed}`, 'red')}`
}

export function flag(d: Flag, opts: WidgetOpts): string | null {
  if (opts.variant === 'onoff') return paint(`${d.label}:${d.on ? 'on' : 'off'}`, opts.color ?? (d.on ? 'green' : 'dim'))
  return d.on ? paint(d.label, opts.color ?? 'yellow') : null
}
