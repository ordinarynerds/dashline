import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Payload } from './payload.ts'
import type { WidgetOpts } from './widgets/types.ts'
import { widgetNames } from './widgets/registry.ts'

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

  const home = join(homedir(), '.claude')
  const trusted = new Set([join(home, 'settings.json'), join(home, 'settings.local.json')])

  const candidates = [
    join(home, 'settings.json'),
    join(home, 'settings.local.json'),
    project && join(project, '.claude', 'settings.json'),
    project && join(project, '.claude', 'settings.local.json'),
  ].filter((f): f is string => typeof f === 'string')

  let merged: Partial<DashlineConfig> = {}
  let linesTrusted = true
  const seen = new Set<string>()
  for (const file of candidates) {
    if (seen.has(file)) continue
    seen.add(file)
    const found = read(file)
    if (found.lines !== undefined) linesTrusted = trusted.has(file)
    merged = Object.assign(merged, found)
  }

  let lines = merged.lines ?? DEFAULT_LINES
  if (!linesTrusted) lines = lines.map(withoutCommands)

  return { ...DEFAULTS, ...merged, lines }
}

// Commands only run from the user's own settings. Config that rides in through a
// project (a cloned repo) may arrange widgets but never introduce a command.
function withoutCommands(line: LineSpec): LineSpec {
  if (Array.isArray(line)) return line.filter(isWidget)
  const zones: Zones = {}
  if (line.left) zones.left = line.left.filter(isWidget)
  if (line.center) zones.center = line.center.filter(isWidget)
  if (line.right) zones.right = line.right.filter(isWidget)
  return zones
}

function isWidget(item: Item): boolean {
  return widgetNames.has(Array.isArray(item) ? item[0] : item)
}

function read(file: string): Partial<DashlineConfig> {
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { dashline?: unknown }
    return parsed.dashline && typeof parsed.dashline === 'object' ? (parsed.dashline as Partial<DashlineConfig>) : {}
  } catch {
    return {}
  }
}
