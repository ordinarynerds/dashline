import type { Datum } from '../datum.ts'
import type { Ctx, WidgetOpts } from '../widgets/types.ts'
import { paint, styleTerm } from '../style.ts'
import { percent } from './percent.ts'
import { duration, money, delta, flag } from './scalars.ts'
import { label } from './label.ts'

export function present(datum: Datum, opts: WidgetOpts, ctx: Ctx): string | null {
  const text = body(datum, opts, ctx)
  // A widget with nothing to say draws nothing at all — chrome must never resurrect it into an
  // item consisting of just an icon.
  if (text == null || text === '') return null
  return chrome(text, datum, opts)
}

function body(datum: Datum, opts: WidgetOpts, ctx: Ctx): string | null {
  switch (datum.kind) {
    case 'percent':
      return percent(datum, opts, ctx)
    case 'duration':
      return duration(datum, opts)
    case 'money':
      return money(datum, opts)
    case 'delta':
      return delta(datum, opts)
    case 'label':
      return label(datum, opts)
    case 'flag':
      return flag(datum, opts)
  }
}

// The icon and the label, applied the same way for every kind.
//
// Each used to live inside a single presenter — the icon in label.ts, the label in percent.ts —
// so `{ "icon": "$" }` on a cost silently did nothing, and `{ "label": "spend" }` worked on the
// three percent widgets and nowhere else. Neither has anything to do with how a value is drawn,
// so neither belongs to the code that knows how to draw one, any more than `color` does.
//
// Applying them here also means they survive a variant: the percent presenter returns early for
// every variant it knows, so a label used to vanish the moment you asked for a bar.
function chrome(text: string, d: Datum, opts: WidgetOpts): string {
  const out: string[] = []

  const icon = opts.icon ?? d.icon
  // A widget that ships its own icon may colour it — worktree's ⌂ is yellow. One that came from
  // config has no colour of its own and goes dim.
  if (icon) out.push(paint(icon, styleTerm(d.iconColor ?? 'dim', opts)))

  const label = opts.label ?? d.label
  if (label) out.push(paint(label, styleTerm('dim', opts)))

  out.push(text)
  return out.join(' ')
}
