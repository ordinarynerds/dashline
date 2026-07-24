import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Payload } from './payload.ts'
import type { WidgetOpts } from './widgets/types.ts'

export type Item = string | [string, string | WidgetOpts]

export interface Zones {
  left?: Item[]
  center?: Item[]
  right?: Item[]
}

export type LineSpec = Item[] | Zones

export interface DashlineConfig {
  lines: LineSpec[]
  separator: string
  margin: number
  warn: number
  compact: number
  usageWarn: number
  usageCrit: number
}

const DEFAULTS: Omit<DashlineConfig, 'lines'> = {
  separator: '·',
  margin: 5,
  warn: 40,
  compact: 50,
  usageWarn: 70,
  usageCrit: 90,
}

const DEFAULT_LINES: LineSpec[] = [
  { left: ['branch', 'model', 'context'], right: ['session', 'weekly'] },
]

export function loadConfig(payload: Payload): DashlineConfig {
  const project = payload.workspace?.project_dir ?? payload.workspace?.current_dir ?? payload.cwd

  const files = [
    join(homedir(), '.claude', 'settings.json'),
    project && join(project, '.claude', 'settings.json'),
    project && join(project, '.claude', 'settings.local.json'),
  ].filter((f): f is string => typeof f === 'string')

  const merged = files.reduce<Partial<DashlineConfig>>((acc, file) => Object.assign(acc, read(file)), {})

  return { ...DEFAULTS, ...merged, lines: merged.lines ?? DEFAULT_LINES }
}

function read(file: string): Partial<DashlineConfig> {
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { dashline?: unknown }
    return parsed.dashline && typeof parsed.dashline === 'object' ? (parsed.dashline as Partial<DashlineConfig>) : {}
  } catch {
    return {}
  }
}
