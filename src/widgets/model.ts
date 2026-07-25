import type { Widget } from './types.ts'

export const model: Widget = {
  data({ payload }, opts) {
    if (opts.variant === 'id') {
      const id = payload.model?.id
      return id ? { kind: 'label', text: id, color: 'dim' } : null
    }
    const full = payload.model?.display_name
    if (!full) return null
    // The default trims the trailing parenthetical, so "Opus 4.8 (1M context)" reads as
    // "Opus 4.8". `full` keeps it, for anyone who switches between context sizes and
    // wants to see which one is live.
    if (opts.variant === 'full') return { kind: 'label', text: full, color: 'bold' }
    return { kind: 'label', text: full.replace(/\s*\([^)]*\)\s*$/, ''), color: 'bold' }
  },
}
