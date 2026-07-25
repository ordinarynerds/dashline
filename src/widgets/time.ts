import type { Widget } from './types.ts'

// Wall clock at the moment of the last render. The status line only redraws when Claude
// Code refreshes it, so this reads as the time of the last turn rather than a ticking
// clock — useful for dating a screenshot, not for watching the minutes pass.
export const time: Widget = {
  data({ now }, opts) {
    const d = new Date(now * 1000)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    if (opts.variant === 'seconds') return label(`${hh}:${mm}:${String(d.getSeconds()).padStart(2, '0')}`)
    if (opts.variant === 'hm12') {
      const h12 = d.getHours() % 12 || 12
      return label(`${h12}:${mm}${d.getHours() < 12 ? 'am' : 'pm'}`)
    }
    return label(`${hh}:${mm}`)
  },
}

function label(text: string) {
  return { kind: 'label' as const, text, color: 'dim' }
}
