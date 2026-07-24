import type { Datum } from '../datum.ts'
import type { Ctx, WidgetOpts } from '../widgets/types.ts'
import { percent } from './percent.ts'
import { duration, money, delta, flag } from './scalars.ts'
import { label } from './label.ts'

export function present(datum: Datum, opts: WidgetOpts, ctx: Ctx): string | null {
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
