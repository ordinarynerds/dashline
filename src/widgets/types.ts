import type { Payload } from '../payload.ts'
import type { GitInfo } from '../util/git.ts'
import type { Datum } from '../datum.ts'

export interface Thresholds {
  warn: number
  compact: number
  usageWarn: number
  usageCrit: number
}

export interface Ctx {
  payload: Payload
  git: GitInfo
  thresholds: Thresholds
  now: number
}

export interface WidgetOpts {
  color?: string
  variant?: string
  bar?: string
}

export interface Widget {
  data(ctx: Ctx, opts: WidgetOpts): Datum | null
}
