import type { Payload } from '../payload.ts'
import type { GitInfo } from '../util/git.ts'
import type { Datum } from '../datum.ts'

export interface Thresholds {
  warning: number
  critical: number
  usageWarning: number
  usageCritical: number
}

export interface Ctx {
  payload: Payload
  git: GitInfo
  thresholds: Thresholds
  now: number
}

export interface WidgetOpts {
  // presentation
  color?: string
  variant?: string
  bar?: string
  // data
  label?: string
  countdown?: boolean
  warningAt?: number
  criticalAt?: number
  width?: number
  truncate?: number
  icon?: string
}

export interface Widget {
  data(ctx: Ctx, opts: WidgetOpts): Datum | null
}
