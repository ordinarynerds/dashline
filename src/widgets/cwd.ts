import type { Widget } from './types.ts'
import { homedir } from 'node:os'

export const cwd: Widget = {
  data({ payload }) {
    const dir = payload.workspace?.current_dir ?? payload.cwd
    if (!dir) return null
    const home = homedir()
    const text = home && dir.startsWith(home) ? `~${dir.slice(home.length)}` : dir
    return { kind: 'label', text, color: 'dim' }
  },
}
