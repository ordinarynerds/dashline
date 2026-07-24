export type Datum = Percent | Duration | Money | Delta | Label | Flag

export interface Percent {
  kind: 'percent'
  value: number
  scale: 'context' | 'usage'
  label?: string
  reset?: number
  tokens?: { used: number; size: number }
  hint?: boolean
  defaultBar?: boolean
}

export interface Duration {
  kind: 'duration'
  ms: number
}

export interface Money {
  kind: 'money'
  usd: number
}

export interface Delta {
  kind: 'delta'
  added: number
  removed: number
}

export interface Label {
  kind: 'label'
  text: string
  icon?: string
  iconColor?: string
  color?: string
}

export interface Flag {
  kind: 'flag'
  on: boolean
  label: string
}
