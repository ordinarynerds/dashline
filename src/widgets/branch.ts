import type { Widget } from './types.ts'
import { paint } from '../style.ts'

export const branch: Widget = {
  render({ git }) {
    if (!git.branch) return null
    return `${paint('⎇', 'dim')} ${paint(git.branch, 'cyan')}`
  },
}
