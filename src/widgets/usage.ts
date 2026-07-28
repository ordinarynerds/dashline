import type { Widget } from './types.ts'

// The plan-usage widgets name themselves, because "61%" on its own says nothing about what is
// 61% full. That name belongs to the widget's full presentation though: a variant asks for one
// piece in isolation — only the meter, only the number — so it opts out of the name along with
// everything else. A label named in config is a direct request and always survives, which
// present() handles by preferring `opts.label`.
export const named = (label: string, variant: string | undefined) => (variant ? undefined : label)

export const session: Widget = {
  data({ payload }, opts) {
    const w = payload.rate_limits?.five_hour
    if (w?.used_percentage == null) return null
    return {
      kind: 'percent',
      value: w.used_percentage,
      scale: 'usage',
      label: named('session', opts.variant),
      reset: w.resets_at,
    }
  },
}

export const weekly: Widget = {
  data({ payload }, opts) {
    const w = payload.rate_limits?.seven_day
    if (w?.used_percentage == null) return null
    return {
      kind: 'percent',
      value: w.used_percentage,
      scale: 'usage',
      label: named('All', opts.variant),
      reset: w.resets_at,
    }
  },
}
