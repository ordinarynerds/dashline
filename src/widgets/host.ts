import { hostname } from 'node:os'
import type { Widget } from './types.ts'

// Which machine this session is on. The `ssh` variant shows it only when the session is
// remote, which is the case where confusing two terminals actually costs you something.
export const host: Widget = {
  data(_ctx, opts) {
    if (opts.variant === 'ssh' && !process.env.SSH_CONNECTION && !process.env.SSH_TTY) return null
    const name = hostname().replace(/\.local$/, '')
    if (!name) return null
    return { kind: 'label', text: name, color: 'dim' }
  },
}
