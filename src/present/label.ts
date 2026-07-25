import type { Label } from '../datum.ts'
import type { WidgetOpts } from '../widgets/types.ts'
import { paint, styleTerm } from '../style.ts'
import { clip } from '../util/width.ts'
import { basename } from 'node:path'

export function label(d: Label, opts: WidgetOpts): string {
  let text = d.text
  const v = opts.variant
  if (v === 'basename') text = basename(text)
  else if (v === 'upper') text = text.toUpperCase()
  else if (v === 'lower') text = text.toLowerCase()

  const limit = opts.truncate ?? (v?.startsWith('truncate:') ? Number(v.slice('truncate:'.length)) : 0)
  if (limit > 0) text = clip(text, limit) // width-aware and code-point safe

  const color = opts.color ?? d.color
  const term = styleTerm(color, opts)
  // The icon is chrome and belongs to every kind, so present() adds it — see present/index.ts.
  return term || opts.bg ? paint(text, term, opts.bg) : text
}
