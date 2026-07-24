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

  const limit = opts.truncate ?? (v?.startsWith('truncate:') ? Number(v.slice('truncate:'.length)) : 0)
  if (limit > 0 && text.length > limit) text = `${text.slice(0, limit - 1)}…`

  const color = opts.color ?? d.color
  const body = color ? paint(text, color) : text
  const icon = opts.icon ?? d.icon
  return icon ? `${paint(icon, d.iconColor ?? 'dim')} ${body}` : body
}
