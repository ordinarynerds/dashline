import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import type { Payload } from './payload.ts'
import type { WidgetOpts } from './widgets/types.ts'
import { widgetNames } from './widgets/registry.ts'

export interface TextItem {
  text: string
  color?: string
}

export type Item = string | [string, string | WidgetOpts] | TextItem

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
  contextWarningAt: number
  contextCriticalAt: number
  usageWarningAt: number
  usageCriticalAt: number
}

const DEFAULTS: Omit<DashlineConfig, 'lines'> = {
  separator: '·',
  margin: 5,
  contextWarningAt: 40,
  contextCriticalAt: 50,
  usageWarningAt: 70,
  usageCriticalAt: 90,
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
// project (a cloned repo) may arrange widgets and text but never introduce a command.
function withoutCommands(line: LineSpec): LineSpec {
  if (Array.isArray(line)) return line.filter(keep)
  const zones: Zones = {}
  if (line.left) zones.left = line.left.filter(keep)
  if (line.center) zones.center = line.center.filter(keep)
  if (line.right) zones.right = line.right.filter(keep)
  return zones
}

// A command is a bare string (or [id, ...]) whose id is not a widget. Widget items
// and text items are safe to keep from an untrusted source.
function keep(item: Item): boolean {
  if (typeof item === 'string') return widgetNames.has(item)
  if (Array.isArray(item)) return widgetNames.has(item[0])
  return true
}

function read(file: string): Partial<DashlineConfig> {
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { dashline?: unknown }
    return parsed.dashline && typeof parsed.dashline === 'object' ? (parsed.dashline as Partial<DashlineConfig>) : {}
  } catch {
    return {}
  }
}
