// Domain model for the dashline playground. Everything the builder knows about widgets,
// colors, and the shape of a dashline config lives here so the UI stays presentational.
// dashline in the terminal remains the source of truth; the sample renderings below are an
// approximate preview.

export type ColorName =
  | 'white'
  | 'dim'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'gray'
  | 'black'
  | 'bold'
  | 'coral'

// The Ordinary Nerds / dashline terminal palette. These are the values being previewed, so
// they live here as data rather than as chrome tokens.
export const COLORS: Record<ColorName, string> = {
  white: '#F5F5F5',
  dim: '#6B6B70',
  red: '#FF5555',
  green: '#35D13B',
  yellow: '#E5B93A',
  blue: '#6AA6FF',
  magenta: '#C678DD',
  cyan: '#4EC9D6',
  gray: '#6B6B70',
  black: '#000000',
  bold: '#F5F5F5',
  coral: '#FF6B4A',
}

// Colors offered as per-widget overrides in the builder.
export const COLOR_CHOICES: ColorName[] = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'coral', 'white', 'dim']

// JSON syntax highlighting, colored from the same palette.
export const SYNTAX: Record<string, ColorName> = {
  key: 'cyan',
  str: 'green',
  num: 'yellow',
  bool: 'coral',
  punct: 'dim',
  plain: 'white',
}

export const THEMES: Record<string, Partial<Record<ColorName, string>>> = {
  nord: { red: '#BF616A', green: '#A3BE8C', yellow: '#EBCB8B', blue: '#81A1C1', magenta: '#B48EAD', cyan: '#88C0D0', gray: '#4C566A' },
  dracula: { red: '#FF5555', green: '#50FA7B', yellow: '#F1FA8C', blue: '#6272A4', magenta: '#FF79C6', cyan: '#8BE9FD', gray: '#6272A4' },
  gruvbox: { red: '#CC241D', green: '#98971A', yellow: '#D79921', blue: '#458588', magenta: '#B16286', cyan: '#689D6A', gray: '#928374' },
  catppuccin: { red: '#F38BA8', green: '#A6E3A1', yellow: '#F9E2AF', blue: '#89B4FA', magenta: '#CBA6F7', cyan: '#94E2D5', gray: '#6C7086' },
}

export const THEME_NAMES = ['', 'nord', 'dracula', 'gruvbox', 'catppuccin']

// Preview glyphs. The terminal uses Nerd Font icons; these are monochrome Unicode stand-ins so
// the icons toggle has a visible effect in the browser. Every widget has one.
export const ICONS: Record<string, string> = {
  branch: '⎇',
  model: '◆',
  context: '▤',
  session: '⧗',
  weekly: '∑',
  cost: '$',
  duration: '◷',
  lines: '±',
  pr: '⌥',
  review: '✓',
  worktree: '⌂',
  cwd: '▸',
  repo: '⌗',
  effort: '◉',
  name: '✦',
  output: '⎔',
  version: '⎋',
  burn: '⏣',
  fast: '»',
  thinking: '✲',
  vim: '⌨',
  agent: '⟐',
}

// Monochrome glyphs offered as a per-item icon in the builder. These render in the browser and
// are emitted verbatim as the item's `icon`. In a terminal with a Nerd Font you can set any
// glyph; this is a friendly starting set.
export const ICON_CHOICES: string[] = [
  '⎇', '◆', '●', '★', '⚑', '⌂', '⌘', '⌥', '✦', '✳', '◷', '⧗', '∑', '±', '»', '→', '↑', '↓', '⌗', '⎔', '⎋', '⏣', '⟐', '◉', '▸', '✓', '⊙',
]

export type Part = [string, ColorName]

export type CategoryKey = 'git' | 'model' | 'usage' | 'session'
export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'git', label: 'Git & repo' },
  { key: 'model', label: 'Model & mode' },
  { key: 'usage', label: 'Usage & cost' },
  { key: 'session', label: 'Session' },
]

export interface WidgetMeta {
  name: string
  desc: string
  category: CategoryKey
  parts: Part[]
}

export const WIDGETS: Record<string, WidgetMeta> = {
  branch: { name: 'git branch', desc: 'Current git branch', category: 'git', parts: [['main', 'cyan']] },
  repo: { name: 'repo name', desc: 'Repository name', category: 'git', parts: [['dashline', 'dim']] },
  cwd: { name: 'working dir', desc: 'Working directory path', category: 'git', parts: [['~/Development/dashline', 'dim']] },
  worktree: { name: 'worktree', desc: 'Active git worktree', category: 'git', parts: [['hotfix', 'yellow']] },
  pr: { name: 'PR number', desc: 'Pull request for the branch', category: 'git', parts: [['PR #702', 'magenta']] },
  review: { name: 'review state', desc: 'Review state of the PR', category: 'git', parts: [['pending', 'yellow']] },
  lines: { name: 'lines +/-', desc: 'Lines added and removed', category: 'git', parts: [['+156', 'green'], [' -23', 'red']] },

  model: { name: 'model', desc: 'Active model name', category: 'model', parts: [['Opus 4.8', 'bold']] },
  effort: { name: 'effort', desc: 'Reasoning effort level', category: 'model', parts: [['high', 'dim']] },
  fast: { name: 'fast mode', desc: 'Fast mode indicator', category: 'model', parts: [['fast', 'yellow']] },
  thinking: { name: 'thinking', desc: 'Extended thinking indicator', category: 'model', parts: [['thinking', 'yellow']] },
  vim: { name: 'vim mode', desc: 'Vim editing mode', category: 'model', parts: [['NORMAL', 'dim']] },
  agent: { name: 'subagent', desc: 'Active subagent', category: 'model', parts: [['security-reviewer', 'magenta']] },

  context: { name: 'context', desc: 'Context window used, with bar', category: 'usage', parts: [['44%', 'yellow'], [' ████░░░░░░', 'yellow'], [' (440k/1.0M)', 'dim'], [' · high', 'yellow']] },
  session: { name: 'session usage', desc: '5-hour usage and reset countdown', category: 'usage', parts: [['session ', 'dim'], ['61%', 'green'], [' (↻2h11m)', 'dim']] },
  weekly: { name: 'weekly usage', desc: 'Weekly usage across models', category: 'usage', parts: [['All ', 'dim'], ['74%', 'yellow']] },
  cost: { name: 'cost', desc: 'Estimated session cost', category: 'usage', parts: [['$2.69', 'green']] },
  burn: { name: 'burn (ETA)', desc: 'Burn rate and time to compact', category: 'usage', parts: [['→ /compact ~18m', 'red']] },
  duration: { name: 'duration', desc: 'Time since the session started', category: 'usage', parts: [['37m', 'dim']] },

  name: { name: 'session name', desc: 'Generated session name', category: 'session', parts: [['celestial-vega', 'dim']] },
  output: { name: 'output style', desc: 'Active output style', category: 'session', parts: [['/rc', 'dim']] },
  version: { name: 'CC version', desc: 'Claude Code version', category: 'session', parts: [['v2.1.90', 'dim']] },
}

export const ORDER: string[] = Object.keys(WIDGETS)

export function widgetsByCategory(cat: CategoryKey): string[] {
  return ORDER.filter((id) => WIDGETS[id]?.category === cat)
}

// The palette laid out flat in category order. This is the source of truth for the draggable
// index of each palette row, so a drag from the palette resolves back to a widget id.
export const PALETTE_ORDER: string[] = CATEGORIES.flatMap((c) => widgetsByCategory(c.key))

// Data-visualisation variants and bar styles, matching dashline's percent presenter.
export type Variant = 'pct' | 'bar' | 'gauge' | 'ratio' | 'tokens' | 'history'
export const VARIANTS: Variant[] = ['pct', 'bar', 'gauge', 'ratio', 'tokens', 'history']

export type BarStyle = 'blocks' | 'shade' | 'line' | 'ascii' | 'fine' | 'gradient'
export const BAR_STYLES: BarStyle[] = ['blocks', 'shade', 'line', 'ascii', 'fine', 'gradient']

// A placed widget with its per-widget options. Empty options render the widget's defaults.
export interface Item {
  widget: string
  color?: ColorName
  label?: string
  variant?: Variant
  bar?: BarStyle
  trend?: boolean
  icon?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

// Text-attribute options, in the order the toggles appear in the item menu.
export const TEXT_STYLES = ['bold', 'italic', 'underline'] as const
export type TextStyle = (typeof TEXT_STYLES)[number]

export type ItemOption = Omit<Item, 'widget'>

// Widgets whose value is a percentage, so they accept variant / bar / trend options. `detail`
// is the trailing context (ratio, countdown) kept alongside the bar and gauge variants.
interface PercentState {
  value: number
  tone: ColorName
  prefix?: string
  ratio: string
  tokens: string
  detail: Part[]
}

const PERCENT: Record<string, PercentState> = {
  context: { value: 44, tone: 'yellow', ratio: '440k/1.0M', tokens: '440k', detail: [[' (440k/1.0M)', 'dim'], [' · high', 'yellow']] },
  session: { value: 61, tone: 'green', prefix: 'session ', ratio: '61/100', tokens: '61%', detail: [[' (↻2h11m)', 'dim']] },
  weekly: { value: 74, tone: 'yellow', prefix: 'All ', ratio: '74/100', tokens: '74%', detail: [] },
}

export function isPercent(id: string): boolean {
  return id in PERCENT
}

const BAR_GLYPHS: Record<BarStyle, [string, string]> = {
  blocks: ['█', '░'],
  shade: ['▓', '░'],
  line: ['━', '┈'],
  ascii: ['#', '-'],
  fine: ['█', '░'],
  gradient: ['█', '░'],
}

function drawBar(value: number, style: BarStyle, width = 10): string {
  const [full, empty] = BAR_GLYPHS[style] ?? BAR_GLYPHS.blocks
  const filled = Math.round((value / 100) * width)
  const bar = full.repeat(filled) + empty.repeat(Math.max(0, width - filled))
  return style === 'ascii' ? `[${bar}]` : bar
}

// A short bar in the given style, for previewing options in menus.
export function barSample(style: BarStyle, value = 60, width = 6): string {
  return drawBar(value, style, width)
}

const GAUGE = ['○', '◔', '◑', '◕', '●']

// A snapshot of the live-changing values, so the terminal preview can play through believable
// states (fresh session → context filling → near the limit) instead of one frozen frame.
export interface Scenario {
  name: string
  context: number
  session: number
  weekly: number
  branch?: string
  cost?: string
  duration?: string
  effort?: string
  reset?: string
}

export const SCENARIOS: Scenario[] = [
  { name: 'Fresh session', context: 8, session: 12, weekly: 41, branch: 'main', cost: '$0.14', duration: '2m', effort: 'low', reset: '4h58m' },
  { name: 'Warming up', context: 33, session: 36, weekly: 53, branch: 'main', cost: '$1.02', duration: '19m', effort: 'med', reset: '4h20m' },
  { name: 'Deep work', context: 61, session: 58, weekly: 67, branch: 'feat/api', cost: '$3.18', duration: '48m', effort: 'high', reset: '3h11m' },
  { name: 'Context filling', context: 84, session: 73, weekly: 79, branch: 'feat/api', cost: '$5.40', duration: '1h12m', effort: 'high', reset: '2h02m' },
  { name: 'Near the limit', context: 96, session: 91, weekly: 88, branch: 'hotfix', cost: '$8.26', duration: '2h04m', effort: 'high', reset: '0h41m' },
]

// Percent tone by load, so colors shift green → yellow → red as a scenario fills up.
function toneFor(value: number): ColorName {
  if (value >= 80) return 'red'
  if (value >= 50) return 'yellow'
  return 'green'
}

// The live percent state for a widget: the static sample, or the scenario's values recolored
// and re-tokenized so the numbers stay believable as they move.
function resolvePercent(widget: string, scenario?: Scenario): PercentState | null {
  const base = PERCENT[widget]
  if (!base) return null
  if (!scenario) return base
  const value = widget === 'context' ? scenario.context : widget === 'session' ? scenario.session : scenario.weekly
  const tone = toneFor(value)
  if (widget === 'context') {
    const usedK = Math.max(1, Math.round((value / 100) * 1000))
    return { value, tone, ratio: `${usedK}k/1.0M`, tokens: `${usedK}k`, detail: [[` (${usedK}k/1.0M)`, 'dim'], [` · ${scenario.effort ?? 'high'}`, tone]] }
  }
  if (widget === 'session') {
    return { value, tone, prefix: 'session ', ratio: `${value}/100`, tokens: `${value}%`, detail: [[` (↻${scenario.reset ?? '2h11m'})`, 'dim']] }
  }
  return { value, tone, prefix: 'All ', ratio: `${value}/100`, tokens: `${value}%`, detail: [] }
}

// The default (no-variant) look of a live widget, rebuilt from a scenario so playback moves the
// numbers, bars, and colors even when the user hasn't chosen an explicit variant.
function scenarioParts(widget: string, scenario?: Scenario): Part[] | null {
  if (!scenario) return null
  const p = resolvePercent(widget, scenario)
  if (p) {
    if (widget === 'context') return [[`${p.value}%`, p.tone], [` ${drawBar(p.value, 'blocks')}`, p.tone], ...p.detail]
    return [[p.prefix ?? '', 'dim'], [`${p.value}%`, p.tone], ...p.detail]
  }
  switch (widget) {
    case 'branch':
      return scenario.branch ? [[scenario.branch, 'cyan']] : null
    case 'cost':
      return scenario.cost ? [[scenario.cost, 'green']] : null
    case 'duration':
      return scenario.duration ? [[scenario.duration, 'dim']] : null
    case 'effort':
      return scenario.effort ? [[scenario.effort, 'dim']] : null
    default:
      return null
  }
}

function percentParts(item: Item, scenario?: Scenario): Part[] | null {
  const s = resolvePercent(item.widget, scenario)
  if (!s || (!item.variant && !item.bar)) return null
  const variant: Variant = item.variant ?? 'bar'
  const pct = `${s.value}%`
  const head = (s.prefix ?? '') + pct
  switch (variant) {
    case 'pct':
      return [[head, s.tone]]
    case 'gauge':
      return [[head + ' ', s.tone], [GAUGE[Math.min(GAUGE.length - 1, Math.floor((s.value / 100) * GAUGE.length))], s.tone], ...s.detail]
    case 'ratio':
      return [[(s.prefix ?? '') + `(${s.ratio})`, 'dim']]
    case 'tokens':
      return [[(s.prefix ?? '') + s.tokens, s.tone]]
    case 'history':
      return [[(s.prefix ?? '') + '▁▂▃▅▇▆', s.tone]]
    case 'bar':
    default:
      return [[head + ' ', s.tone], [drawBar(s.value, item.bar ?? 'blocks'), s.tone], ...s.detail]
  }
}

// The colored parts a placed item renders, applying its variant, bar, label, and trend. An
// optional scenario overrides the live values so the terminal preview can play through states.
export function widgetParts(item: Item, scenario?: Scenario): Part[] {
  const base = percentParts(item, scenario) ?? scenarioParts(item.widget, scenario) ?? WIDGETS[item.widget]?.parts ?? []
  let parts: Part[] = base.map((p) => [...p] as Part)
  if (item.label) parts = [[`${item.label} `, 'dim'], ...parts]
  if (item.trend) parts = [...parts, [' ↑', 'green']]
  return parts
}

export interface Line {
  left: Item[]
  center: Item[]
  right: Item[]
}

export type ZoneKey = 'left' | 'center' | 'right'
export const ZONES: ZoneKey[] = ['left', 'center', 'right']
export const ZONE_LABELS: Record<ZoneKey, string> = { left: 'Left', center: 'Center', right: 'Right' }

export interface Settings {
  theme: string
  powerline: boolean
  icons: boolean
  separator: string
  margin: number
  contextWarningAt: number
  contextCriticalAt: number
  usageWarningAt: number
  usageCriticalAt: number
}

export type ThresholdKey = 'contextWarningAt' | 'contextCriticalAt' | 'usageWarningAt' | 'usageCriticalAt'

export function defaultSettings(): Settings {
  return {
    theme: '',
    powerline: false,
    icons: false,
    separator: '',
    margin: 0,
    contextWarningAt: 0,
    contextCriticalAt: 0,
    usageWarningAt: 0,
    usageCriticalAt: 0,
  }
}

export function defaultLines(): Line[] {
  return [
    {
      left: [{ widget: 'branch' }, { widget: 'model' }, { widget: 'context' }],
      center: [],
      right: [{ widget: 'session' }, { widget: 'weekly' }],
    },
  ]
}

// Neutral segment tones dashline uses for powerline items without their own background.
export const POWERLINE_BG = ['#3b3b3b', '#2f2f2f']

export function colorOf(name: ColorName, theme: string): string {
  const t = theme ? THEMES[theme] : undefined
  return (t && t[name]) || COLORS[name]
}

// One placed item, as it appears in the config: a bare widget name, or [name, { options }].
function itemToConfig(it: Item): string | [string, Record<string, unknown>] {
  const opts: Record<string, unknown> = {}
  if (it.color) opts.color = it.color
  if (it.label) opts.label = it.label
  if (it.variant) opts.variant = it.variant
  if (it.bar) opts.bar = it.bar
  if (it.trend) opts.trend = true
  if (it.icon) opts.icon = it.icon
  if (it.bold) opts.bold = true
  if (it.italic) opts.italic = true
  if (it.underline) opts.underline = true
  return Object.keys(opts).length ? [it.widget, opts] : it.widget
}

// The `dashline` object the current builder state represents.
export function buildDashline(settings: Settings, lines: Line[]): Record<string, unknown> {
  const dashline: Record<string, unknown> = {}
  if (settings.theme) dashline.theme = settings.theme
  if (settings.powerline) dashline.powerline = true
  if (settings.icons) dashline.icons = true
  if (settings.separator) dashline.separator = settings.separator
  if (settings.margin > 0) dashline.margin = settings.margin
  if (settings.contextWarningAt > 0) dashline.contextWarningAt = settings.contextWarningAt
  if (settings.contextCriticalAt > 0) dashline.contextCriticalAt = settings.contextCriticalAt
  if (settings.usageWarningAt > 0) dashline.usageWarningAt = settings.usageWarningAt
  if (settings.usageCriticalAt > 0) dashline.usageCriticalAt = settings.usageCriticalAt

  dashline.lines = lines.map((ln) => {
    const left = ln.left.map(itemToConfig)
    if (!ln.center.length && !ln.right.length) return left
    const zones: Record<string, unknown[]> = {}
    if (ln.left.length) zones.left = left
    if (ln.center.length) zones.center = ln.center.map(itemToConfig)
    if (ln.right.length) zones.right = ln.right.map(itemToConfig)
    return zones
  })
  return dashline
}

export function toConfig(settings: Settings, lines: Line[]): string {
  return JSON.stringify({ dashline: buildDashline(settings, lines) }, null, 2)
}

// The reverse of buildDashline / itemToConfig: read an edited config back into builder state so
// the Code view is two-way. Permissive on options (unknown or mistyped keys are ignored) but
// strict on shape, returning a message the editor can surface instead of throwing.
export type ParseResult = { ok: true; settings: Settings; lines: Line[] } | { ok: false; error: string }

function applyOpts(item: Item, opts: Record<string, unknown>): void {
  if (typeof opts.color === 'string') item.color = opts.color as ColorName
  if (typeof opts.label === 'string') item.label = opts.label
  if (typeof opts.variant === 'string') item.variant = opts.variant as Variant
  if (typeof opts.bar === 'string') item.bar = opts.bar as BarStyle
  if (opts.trend === true) item.trend = true
  if (typeof opts.icon === 'string') item.icon = opts.icon
  if (opts.bold === true) item.bold = true
  if (opts.italic === true) item.italic = true
  if (opts.underline === true) item.underline = true
}

function parseItem(raw: unknown): Item | null {
  if (typeof raw === 'string') return { widget: raw }
  if (Array.isArray(raw)) {
    const [name, second] = raw
    if (typeof name !== 'string') return null
    const item: Item = { widget: name }
    if (typeof second === 'string') item.color = second as ColorName
    else if (second && typeof second === 'object') applyOpts(item, second as Record<string, unknown>)
    return item
  }
  return null // literal { text } items have no builder equivalent
}

function parseLine(raw: unknown): Line {
  const line: Line = { left: [], center: [], right: [] }
  const items = (arr: unknown): Item[] => (Array.isArray(arr) ? (arr.map(parseItem).filter(Boolean) as Item[]) : [])
  if (Array.isArray(raw)) {
    line.left = items(raw)
  } else if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    line.left = items(o.left)
    line.center = items(o.center)
    line.right = items(o.right)
  }
  return line
}

function parseSettings(d: Record<string, unknown>): Settings {
  const s = defaultSettings()
  if (typeof d.theme === 'string' && THEME_NAMES.includes(d.theme)) s.theme = d.theme
  if (d.powerline === true) s.powerline = true
  if (d.icons === true) s.icons = true
  if (typeof d.separator === 'string') s.separator = d.separator
  if (typeof d.margin === 'number' && Number.isFinite(d.margin)) s.margin = Math.max(0, Math.min(1000, Math.floor(d.margin)))
  for (const key of ['contextWarningAt', 'contextCriticalAt', 'usageWarningAt', 'usageCriticalAt'] as ThresholdKey[]) {
    const v = d[key]
    if (typeof v === 'number' && Number.isFinite(v)) s[key] = Math.max(0, Math.min(100, Math.floor(v)))
  }
  return s
}

export function parseConfig(text: string): ParseResult {
  let root: unknown
  try {
    root = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Invalid JSON' }
  }
  if (!root || typeof root !== 'object') return { ok: false, error: 'Expected a JSON object' }
  const dashline = (root as Record<string, unknown>).dashline
  if (!dashline || typeof dashline !== 'object') return { ok: false, error: 'Missing a "dashline" object' }

  const d = dashline as Record<string, unknown>
  if (d.lines !== undefined && !Array.isArray(d.lines)) return { ok: false, error: '"lines" must be an array' }
  const lines = Array.isArray(d.lines) ? d.lines.map(parseLine) : defaultLines()
  if (!lines.length) return { ok: false, error: 'Add at least one line' }
  return { ok: true, settings: parseSettings(d), lines }
}

// A ready-to-paste instruction for Claude Code to set up this exact status line. Pairs with the
// Code view: drop it into a session and Claude Code writes the config into settings.json for you.
export function configPrompt(settings: Settings, lines: Line[]): string {
  return [
    'Set up my Claude Code status line using dashline (https://github.com/ordinarynerds/dashline).',
    '',
    'Merge this into the "dashline" block of ~/.claude/settings.json, keeping my other settings:',
    '',
    '```json',
    toConfig(settings, lines),
    '```',
    '',
    "If dashline isn't installed and wired up as my statusLine yet, do that first, then apply the config.",
  ].join('\n')
}

// A one-liner that merges the config into ~/.claude/settings.json without opening it. The
// dashline object is base64-encoded so no quoting or escaping can break the shell command.
export function installCommand(settings: Settings, lines: Line[]): string {
  const b64 = btoa(JSON.stringify(buildDashline(settings, lines)))
  const script =
    'const fs=require("fs"),p=require("os").homedir()+"/.claude/settings.json",' +
    'd=JSON.parse(Buffer.from(process.argv[1],"base64").toString()),' +
    's=fs.existsSync(p)?JSON.parse(fs.readFileSync(p,"utf8")):{};' +
    's.dashline=d;fs.writeFileSync(p,JSON.stringify(s,null,2)+"\\n");' +
    'console.log("dashline: settings updated")'
  return `node -e '${script}' ${b64}`
}
