import type { Label } from '../datum.ts'
import type { WidgetOpts } from '../widgets/types.ts'
import { paint } from '../style.ts'
import { basename } from 'node:path'

export function label(d: Label, opts: WidgetOpts): string {
  let text = d.text
  const v = opts.variant
  if (v === 'basename') text = basename(text)
  else if (v === 'upper') text = text.toUpperCase()
  else if (v === 'lower') text = text.toLowerCase()
  else if (v?.startsWith('truncate:')) {
    const n = Number(v.slice('truncate:'.length))
    if (n > 0 && text.length > n) text = `${text.slice(0, n - 1)}…`
  }

  const color = opts.color ?? d.color
  const body = color ? paint(text, color) : text
  return d.icon ? `${paint(d.icon, d.iconColor ?? 'dim')} ${body}` : body
}
