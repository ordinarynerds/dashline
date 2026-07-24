import type { Widget } from './types.ts'
import { paint } from '../style.ts'
import { homedir } from 'node:os'
import { basename } from 'node:path'

export const cwd: Widget = {
  render({ payload }, opts) {
    const dir = payload.workspace?.current_dir ?? payload.cwd
    if (!dir) return null
    if (opts.variant === 'basename') return paint(basename(dir), 'dim')
    const home = homedir()
    const shown = home && dir.startsWith(home) ? `~${dir.slice(home.length)}` : dir
    return paint(shown, 'dim')
  },
}
