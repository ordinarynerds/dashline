import type { Payload } from '../payload.ts'
import type { GitInfo, GitNeeds } from '../util/git.ts'
import type { Datum } from '../datum.ts'
import type { Sample } from '../state.ts'

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
  commands?: Map<string, string | null>
  history?: Sample[]
  // Week-to-date spend in USD, summed across sessions. Undefined when nothing asked for it.
  ledger?: number | null
}

export interface WidgetOpts {
  // presentation
  color?: string
  bg?: string
  variant?: string
  bar?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  // data
  label?: string
  countdown?: boolean
  warningAt?: number
  criticalAt?: number
  width?: number
  truncate?: number
  icon?: string
  id?: boolean
  trend?: boolean
}

export interface Widget {
  data(ctx: Ctx, opts: WidgetOpts): Datum | null
  // What this widget needs gathered before it can draw. Declared here rather than in a
  // roster inside scan.ts, so registering a widget is the single act that also states its
  // cost — a widget can't be added and then silently render empty for want of a probe.
  needs?: Needs
}

export interface Needs extends GitNeeds {
  history?: boolean
  ledger?: boolean
}
