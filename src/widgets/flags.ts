import type { Widget } from './types.ts'
import { paint } from '../style.ts'

export const fast: Widget = {
  render({ payload }) {
    return payload.fast_mode ? paint('fast', 'yellow') : null
  },
}

export const thinking: Widget = {
  render({ payload }) {
    return payload.thinking?.enabled ? paint('thinking', 'dim') : null
  },
}

export const vim: Widget = {
  render({ payload }) {
    const mode = payload.vim?.mode
    if (!mode) return null
    return paint(mode, 'dim')
  },
}

export const agent: Widget = {
  render({ payload }) {
    const n = payload.agent?.name
    if (!n) return null
    return paint(n, 'magenta')
  },
}
