import type { Ctx, Widget } from './types.ts'

export const context: Widget = {
  data(ctx) {
    const c = ctx.payload.context_window
    const value = percent(ctx)
    if (value === null) return { kind: 'label', text: '--', color: 'dim' }

    const used = c?.total_input_tokens ?? c?.current_usage?.input_tokens
    const size = c?.context_window_size
    return {
      kind: 'percent',
      value,
      scale: 'context',
      defaultBar: true,
      hint: true,
      tokens: used != null && size != null ? { used, size } : undefined,
    }
  },
}

function percent(ctx: Ctx): number | null {
  const c = ctx.payload.context_window
  if (!c) return null
  if (typeof c.used_percentage === 'number') return c.used_percentage
  const used = c.total_input_tokens ?? c.current_usage?.input_tokens
  if (used != null && c.context_window_size) return (used / c.context_window_size) * 100
  return null
}
