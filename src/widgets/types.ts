import type { Payload } from '../payload.ts'
import type { GitInfo } from '../util/git.ts'

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
  render(ctx: Ctx, opts: WidgetOpts): string | null
}
