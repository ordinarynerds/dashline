import type { Widget } from './types.ts'

export const fast: Widget = {
  data({ payload }) {
    return { kind: 'flag', on: Boolean(payload.fast_mode), label: 'fast' }
  },
}

export const thinking: Widget = {
  data({ payload }) {
    return { kind: 'flag', on: Boolean(payload.thinking?.enabled), label: 'thinking' }
  },
}

export const vim: Widget = {
  data({ payload }) {
    const mode = payload.vim?.mode
    if (!mode) return null
    return { kind: 'label', text: mode, color: 'dim' }
  },
}

export const agent: Widget = {
  data({ payload }) {
    const n = payload.agent?.name
    if (!n) return null
    return { kind: 'label', text: n, color: 'magenta' }
  },
}
