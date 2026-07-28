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
  ordinarynerds: { red: '#FF6B4A', green: '#3FCF8E', yellow: '#F2B441', blue: '#5AA9F0', magenta: '#C678DD', cyan: '#4EC9D6', gray: '#6B6B70' },
}

export const THEME_NAMES = ['', 'nord', 'dracula', 'gruvbox', 'catppuccin', 'ordinarynerds']

// Icons a widget carries in its own datum rather than taking from the icons setting, so these
// draw whether icons are on or off; the Nerd Font glyph below replaces them when it is on. The
// colour is the datum's `iconColor`, dim unless the widget names another.
export const BUILTIN_ICONS: Record<string, { glyph: string; color: ColorName }> = {
  branch: { glyph: '⎇', color: 'dim' },
  worktree: { glyph: '⌂', color: 'yellow' },
}

// The label a widget draws in front of itself when nothing else is asked for. Part of its full
// presentation, so a variant — which asks for one piece in isolation — drops it.
const DEFAULT_LABELS: Record<string, string> = {
  session: 'session',
  weekly: 'All',
}

// `cost` names itself only when it sums a window other than the session in front of you —
// "$41.80" beside "$2.69" is two sums of money with nothing to tell them apart.
function defaultLabel(item: Item): string | undefined {
  if (item.widget !== 'cost') return DEFAULT_LABELS[item.widget]
  return item.period && item.period !== 'session' ? item.period : undefined
}

// Preview glyphs, applied by the icons setting. Every widget renders one now that present()
// owns the icon, so the only constraint is that these keys stay in step with the ICONS table
// in src/render.ts — a glyph here for a widget that table omits would promise a status line
// the terminal does not draw.
export const ICONS: Record<string, string> = {
  branch: '⎇',
  model: '◆',
  cwd: '▸',
  repo: '⌗',
  pr: '⌥',
  review: '✓',
  worktree: '⌂',
  version: '⎋',
  name: '✦',
  effort: '◉',
  output: '⎔',
  cost: '$',
  dirty: '✱',
  sync: '⇅',
  sha: '◈',
  stash: '⚑',
  host: '⌘',
  time: '◷',
}

// Widgets whose datum is a plain piece of text, and so pass through present/label.ts. Only
// those take its text transforms — `basename`, `upper`, `lower` and `truncate` — because only
// those have text to transform.
const LABEL_KIND = new Set([
  'branch', 'cwd', 'worktree', 'dirty', 'sync', 'sha', 'stash', 'pr', 'review', 'repo',
  'model', 'effort', 'vim', 'agent', 'burn', 'name', 'output', 'version', 'host', 'time',
])

export const isLabelKind = (id: string): boolean => LABEL_KIND.has(id)

// Transforms label.ts applies to the drawn text, after the widget's own variant has decided
// what that text is. They share the one `variant` slot: the widget checks it first, and
// anything it does not claim falls through to here.
export const TEXT_VARIANTS = ['basename', 'upper', 'lower'] as const

function transform(text: string, variant: string | undefined): string {
  if (variant === 'basename') return text.slice(text.replace(/\/+$/, '').lastIndexOf('/') + 1)
  if (variant === 'upper') return text.toUpperCase()
  if (variant === 'lower') return text.toLowerCase()
  return text
}

// util/width.ts clip: keep whole code points and spend one column on the ellipsis.
function clip(text: string, width: number): string {
  if (width <= 0) return ''
  const cps = [...text]
  if (cps.length <= width) return text
  return `${cps.slice(0, Math.max(0, width - 1)).join('')}…`
}

// How many columns a line needs, counted the way render.ts composes one: every item's chrome
// and body, with a separator between items in a zone.
//
// Counted from the text rather than measured from the DOM, because the DOM carries editing
// chrome the terminal never prints — each item's remove badge is positioned past its right
// edge, which inflates the element's scroll width and would report a line as clipped when it
// fits perfectly well.
export function lineColumns(line: Line, settings: Settings, thresholds: PctThresholds, scenario?: Scenario): number {
  const sep = [...(settings.separator || ' · ')].length
  let total = 0
  for (const z of ZONES) {
    line[z].forEach((item, i) => {
      if (i > 0) total += sep
      const c = chromeOf(item, settings.icons)
      // Both are drawn with a trailing space.
      if (c.icon) total += [...c.icon].length + 1
      if (c.label) total += [...c.label].length + 1
      total += [...widgetParts(item, scenario, thresholds).map(([t]) => t).join('')].length
    })
  }
  return total
}

// The trimmings drawn around a value: a glyph in front, then a word in front. present() applies
// both for every datum kind, so unlike the value itself they do not vary by widget type.
export interface Chrome {
  icon?: string
  iconColor: ColorName
  label?: string
}

export function chromeOf(item: Item, icons: boolean): Chrome {
  const builtin = BUILTIN_ICONS[item.widget]
  // Explicit item icon, then the setting's glyph, then whatever the widget carries itself.
  const icon = item.icon || (icons ? ICONS[item.widget] : undefined) || builtin?.glyph
  return {
    icon,
    // Only a datum's own icon has a colour of its own; the other two go dim.
    iconColor: icon && icon === builtin?.glyph ? builtin.color : 'dim',
    // A label named in config always wins, and always survives a variant. The widget's own is
    // part of the full presentation a variant opts out of.
    label: item.label ?? (item.variant ? undefined : defaultLabel(item)),
  }
}

// Monochrome glyphs offered as a per-item icon in the builder. These render in the browser and
// are emitted verbatim as the item's `icon`. In a terminal with a Nerd Font you can set any
// glyph; this is a friendly starting set.
export const ICON_CHOICES: string[] = [
  '⎇', '◆', '●', '★', '⚑', '⌂', '⌘', '⌥', '✦', '✳', '◷', '⧗', '∑', '±', '»', '→', '↑', '↓', '⌗', '⎔', '⎋', '⏣', '⟐', '◉', '▸', '✓', '⊙',
  '✱', '⇅', '◈', '∆', '≡',
]

export type Part = [string, ColorName]

export type CategoryKey = 'git' | 'model' | 'usage' | 'session' | 'custom'
export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'git', label: 'Git & repo' },
  { key: 'model', label: 'Model & mode' },
  { key: 'usage', label: 'Usage & cost' },
  { key: 'session', label: 'Session' },
  { key: 'custom', label: 'Custom' },
]

// The two config items that are not widgets: literal text, and a shell command whose
// first line of output is drawn. They ride through the builder under reserved ids that
// can never collide with a widget name, and are translated back on the way out.
export const TEXT_ITEM = '$text'
export const COMMAND_ITEM = '$command'
export const isCustom = (widget: string): boolean => widget === TEXT_ITEM || widget === COMMAND_ITEM

export interface WidgetMeta {
  name: string
  desc: string
  category: CategoryKey
  parts: Part[]
  // Variants offered by a non-percent widget, each with the parts it draws. Percent
  // widgets are driven by PERCENT and percentParts instead, so they leave this unset.
  variants?: Record<string, Part[]>
}

// Reused by `lines` and `diff`, which are both delta-typed and share the presentations.
const DELTA_VARIANTS = (added: number, removed: number): Record<string, Part[]> => ({
  pair: [[`+${added}`, 'green'], [` -${removed}`, 'red']],
  sum: [[`+${added - removed}`, 'green']],
  added: [[`+${added}`, 'green']],
})

export const WIDGETS: Record<string, WidgetMeta> = {
  branch: { name: 'git branch', desc: 'Current git branch', category: 'git', parts: [['main', 'cyan']] },
  repo: {
    name: 'repo name',
    desc: 'Repository name, owner, or host',
    category: 'git',
    parts: [['dashline', 'dim']],
    variants: {
      full: [['ordinarynerds/dashline', 'dim']],
      owner: [['ordinarynerds', 'dim']],
      host: [['github.com', 'dim']],
    },
  },
  cwd: { name: 'working dir', desc: 'Working directory path', category: 'git', parts: [['~/Development/dashline', 'dim']] },
  worktree: { name: 'worktree', desc: 'Active git worktree', category: 'git', parts: [['hotfix', 'yellow']] },
  dirty: {
    name: 'working tree',
    desc: 'Staged, unstaged, and untracked file counts. Each part is also its own variant.',
    category: 'git',
    parts: [['+2 *3 ?1', 'yellow']],
    variants: {
      flags: [['+*?', 'yellow']],
      staged: [['+2', 'green']],
      unstaged: [['*3', 'yellow']],
      untracked: [['?1', 'red']],
      conflicts: [['!1', 'red']],
      clean: [['✓', 'green']],
    },
  },
  sync: {
    name: 'ahead / behind',
    desc: 'Commits ahead of and behind the upstream. Hides when the branch has no upstream.',
    category: 'git',
    parts: [['↑2↓3', 'yellow']],
    variants: { ahead: [['↑2', 'green']], behind: [['↓3', 'yellow']], synced: [['≡', 'green']] },
  },
  sha: { name: 'commit sha', desc: 'Short hash of HEAD', category: 'git', parts: [['a1b2c3d', 'dim']] },
  stash: { name: 'stash', desc: 'Number of stash entries', category: 'git', parts: [['⚑2', 'dim']] },
  diff: {
    name: 'working diff',
    desc: 'Working-tree churn against HEAD. Distinct from lines, which counts what this session wrote.',
    category: 'git',
    parts: [['+42', 'green'], [' -10', 'red']],
    variants: DELTA_VARIANTS(42, 10),
  },
  pr: { name: 'PR number', desc: 'Pull request for the branch', category: 'git', parts: [['PR #702', 'magenta']] },
  review: { name: 'review state', desc: 'Review state of the PR', category: 'git', parts: [['pending', 'yellow']] },
  lines: {
    name: 'lines +/-',
    desc: 'Lines this session added and removed',
    category: 'git',
    parts: [['+156', 'green'], [' -23', 'red']],
    variants: DELTA_VARIANTS(156, 23),
  },

  model: {
    name: 'model',
    desc: 'Active model name. The default trims the context parenthetical; "full" keeps it.',
    category: 'model',
    parts: [['Opus 4.8', 'bold']],
    variants: { full: [['Opus 4.8 (1M context)', 'bold']], id: [['claude-opus-5', 'dim']] },
  },
  effort: { name: 'effort', desc: 'Reasoning effort level', category: 'model', parts: [['high', 'dim']] },
  fast: { name: 'fast mode', desc: 'Fast mode indicator', category: 'model', parts: [['fast', 'yellow']] },
  thinking: { name: 'thinking', desc: 'Extended thinking indicator', category: 'model', parts: [['thinking', 'yellow']] },
  vim: { name: 'vim mode', desc: 'Vim editing mode', category: 'model', parts: [['NORMAL', 'dim']] },
  agent: { name: 'subagent', desc: 'Active subagent', category: 'model', parts: [['security-reviewer', 'magenta']] },

  context: { name: 'context', desc: 'Context window used, with bar', category: 'usage', parts: [['44%', 'yellow'], [' ████░░░░░░', 'yellow'], [' (440k/1.0M)', 'dim'], [' · high', 'yellow']] },
  session: { name: 'session usage', desc: '5-hour usage and reset countdown', category: 'usage', parts: [['session ', 'dim'], ['61%', 'green'], [' (↻2h11m)', 'dim']] },
  weekly: { name: 'weekly usage', desc: 'Weekly usage and reset', category: 'usage', parts: [['All ', 'dim'], ['74%', 'yellow'], [' (↻3d16h)', 'dim']] },
  cost: {
    name: 'cost',
    desc: 'What it has cost. The period picks the window: this session, or the week or month across every session.',
    category: 'usage',
    parts: [['$2.69', 'green']],
    variants: { cents: [['269c', 'green']], round: [['$3', 'green']] },
  },
  rate: {
    name: 'burn rate',
    desc: 'Spend per hour, from cost over duration. Waits for a minute of wall clock.',
    category: 'usage',
    parts: [['$4.10/h', 'green']],
    variants: { cents: [['410c/h', 'green']], round: [['$4/h', 'green']] },
  },
  burn: { name: 'burn (ETA)', desc: 'Burn rate and time to compact', category: 'usage', parts: [['→ /compact ~18m', 'red']] },
  duration: { name: 'duration', desc: 'Time since the session started', category: 'usage', parts: [['37m', 'dim']] },

  name: {
    name: 'session name',
    desc: 'Generated session name, or the bare id',
    category: 'session',
    parts: [['celestial-vega', 'dim']],
    variants: { id: [['abcd1234', 'dim']] },
  },
  output: { name: 'output style', desc: 'Active output style', category: 'session', parts: [['/rc', 'dim']] },
  version: { name: 'CC version', desc: 'Claude Code version', category: 'session', parts: [['v2.1.90', 'dim']] },
  host: {
    name: 'host',
    desc: 'Machine name. The ssh variant shows it only on a remote session.',
    category: 'session',
    parts: [['workbench', 'dim']],
    variants: { ssh: [['workbench', 'dim']] },
  },
  time: {
    name: 'clock',
    desc: 'Time of the last render, not a ticking clock',
    category: 'session',
    parts: [['14:32', 'dim']],
    variants: { seconds: [['14:32:07', 'dim']], hm12: [['2:32pm', 'dim']] },
  },

  [TEXT_ITEM]: {
    name: 'text',
    desc: 'Literal text, drawn as written. Takes a color; no variants.',
    category: 'custom',
    parts: [['api', 'cyan']],
  },
  [COMMAND_ITEM]: {
    name: 'command',
    desc: 'A shell command. dashline draws its first line of output as-is, so colors and variants do not apply.',
    category: 'custom',
    parts: [['gh pr checks', 'dim']],
  },
}

// A freshly dropped item, seeded with the same sample the palette shows so it reads the
// same before and after the drop.
export function newItem(widget: string): Item {
  if (!isCustom(widget)) return { widget }
  const [text, color] = WIDGETS[widget]?.parts[0] ?? ['', 'white']
  return widget === TEXT_ITEM ? { widget, text, color } : { widget, text }
}

export const ORDER: string[] = Object.keys(WIDGETS)

export function widgetsByCategory(cat: CategoryKey): string[] {
  return ORDER.filter((id) => WIDGETS[id]?.category === cat)
}

// The palette laid out flat in category order. This is the source of truth for the draggable
// index of each palette row, so a drag from the palette resolves back to a widget id.
export const PALETTE_ORDER: string[] = CATEGORIES.flatMap((c) => widgetsByCategory(c.key))

// Data-visualisation variants and bar styles, matching dashline's presenters. A variant
// belongs to a type: percent widgets share one set, delta widgets another, and the
// working-tree widgets each name their own parts.
export type Variant =
  | 'pct' | 'bar' | 'gauge' | 'ratio' | 'tokens' | 'left' | 'history'
  | 'pair' | 'sum' | 'added'
  | 'flags' | 'staged' | 'unstaged' | 'untracked' | 'conflicts' | 'clean'
  | 'ahead' | 'behind' | 'synced'
  | 'full' | 'id' | 'owner' | 'host' | 'ssh' | 'seconds' | 'hm12' | 'cents' | 'round'
  | 'basename' | 'upper' | 'lower'

export const VARIANTS: Variant[] = ['pct', 'bar', 'gauge', 'ratio', 'tokens', 'left', 'history']

export type BarStyle = 'blocks' | 'shade' | 'line' | 'ascii' | 'fine' | 'gradient'
export const BAR_STYLES: BarStyle[] = ['blocks', 'shade', 'line', 'ascii', 'fine', 'gradient']

// A placed widget with its per-widget options. Empty options render the widget's defaults.
export interface Item {
  widget: string
  // Content for the custom items: the literal string, or the command line to run.
  text?: string
  color?: ColorName
  label?: string
  variant?: Variant
  bar?: BarStyle
  trend?: boolean
  // Which window `cost` sums. Its own option rather than a variant so it composes with the
  // money variants: a rounded monthly total is period month + variant round.
  period?: Period
  // Shorten a label widget's text to N columns, with an ellipsis. Only label.ts reads it.
  truncate?: number
  icon?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

// The windows `cost` can sum, mirroring src/widgets/cost.ts.
export const PERIODS = ['session', 'week', 'month'] as const
export type Period = (typeof PERIODS)[number]

// Text-attribute options, in the order the toggles appear in the item menu.
export const TEXT_STYLES = ['bold', 'italic', 'underline'] as const
export type TextStyle = (typeof TEXT_STYLES)[number]

export type ItemOption = Omit<Item, 'widget'>

// Widgets whose value is a percentage, so they accept variant / bar / trend options. `detail`
// is the trailing context (ratio, countdown) kept alongside the bar and gauge variants.
interface PercentState {
  value: number
  tone: ColorName
  // The token span behind the percentage, for the `ratio` and `tokens` variants. Only the
  // context window has one; plan usage is a bare percentage, and both variants fall back to
  // the number when this is absent, exactly as the core does.
  ratio?: string
  // Headroom, for the `left` variant. Only meaningful where there is a window size.
  left?: string
  // Whether the default presentation draws a bar without being asked. Mirrors the
  // `defaultBar` flag the context widget sets in the terminal.
  defaultBar?: boolean
  detail: Part[]
}

const PERCENT: Record<string, PercentState> = {
  context: {
    value: 44,
    tone: 'yellow',
    ratio: '440k/1.0M',
    left: '560k left',
    defaultBar: true,
    detail: [[' (440k/1.0M)', 'dim'], [' · high', 'yellow']],
  },
  // No `ratio`: the plan-usage widgets are a bare percentage with no token span behind them,
  // so the core's `ratio` and `tokens` variants fall through to the number (present/percent.ts
  // guards both on `d.tokens`). Inventing "61/100" here would preview a string the terminal
  // has no way to print.
  session: { value: 61, tone: 'green', detail: [[' (↻2h11m)', 'dim']] },
  weekly: { value: 74, tone: 'yellow', detail: [[' (↻3d16h)', 'dim']] },
}

export function isPercent(id: string): boolean {
  return id in PERCENT
}

// The variants a widget offers, empty when it has none. Percent widgets also take a bar
// style and the trend arrow, which `isPercent` still gates on its own.
export function variantsFor(id: string): Variant[] {
  if (isPercent(id)) return VARIANTS
  const own = Object.keys(WIDGETS[id]?.variants ?? {}) as Variant[]
  // A label widget also gets the presenter's text transforms, listed after its own so the
  // widget-specific ones stay first.
  return isLabelKind(id) ? [...own, ...(TEXT_VARIANTS as readonly string[] as Variant[])] : own
}

// Mirrors util/bar.ts glyph for glyph. A bar is always exactly `width` columns, which is why a
// wrapped style spends two of them on its brackets rather than adding to the total — get that
// wrong and the preview shows a bar two columns wider than the terminal draws.
const BAR_SETS: Record<BarStyle, { full: string; empty: string; wrap?: [string, string] }> = {
  blocks: { full: '█', empty: '░' },
  shade: { full: '▓', empty: '░' },
  line: { full: '━', empty: '─' },
  ascii: { full: '#', empty: '-', wrap: ['[', ']'] },
  // `fine` steps in eighths and `gradient` colours per cell; both draw full blocks.
  fine: { full: '█', empty: '░' },
  gradient: { full: '█', empty: '░' },
}

const EIGHTHS = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉']

function drawBar(value: number, style: BarStyle, width = 10): string {
  const ratio = Math.min(100, Math.max(0, value)) / 100
  if (style === 'fine') return fineBar(ratio, width)

  const set = BAR_SETS[style] ?? BAR_SETS.blocks
  const inner = set.wrap ? Math.max(0, width - 2) : width
  const fill = Math.round(ratio * inner)
  const body = set.full.repeat(fill) + set.empty.repeat(inner - fill)
  return set.wrap ? set.wrap[0] + body + set.wrap[1] : body
}

// Eighth blocks give 8 sub-cell steps per column for a smooth edge. Working in whole eighths
// keeps the partial index in 0..7 and the total width exactly `width`.
function fineBar(ratio: number, width: number): string {
  const eighths = Math.round(ratio * width * 8)
  const full = Math.floor(eighths / 8)
  const part = eighths % 8
  const partial = part > 0 && full < width ? EIGHTHS[part] : ''
  const empty = width - full - (partial ? 1 : 0)
  return '█'.repeat(Math.min(full, width)) + partial + '░'.repeat(Math.max(0, empty))
}

// A short bar in the given style, for previewing options in menus.
export function barSample(style: BarStyle, value = 60, width = 6): string {
  return drawBar(value, style, width)
}

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

// A scenario pinned to one value, for showing what a widget looks like exactly at a
// threshold. Lives here beside SCENARIOS rather than inline in the settings panel.
export function previewScenario(at: number): Scenario {
  return { name: 'preview', context: at, session: at, weekly: at, effort: 'high', reset: '2h11m' }
}

// The warning/critical cut-offs that color percentages, mirroring dashline's built-in defaults
// when a threshold is left at 0.
export interface PctThresholds {
  contextWarn: number
  contextCrit: number
  usageWarn: number
  usageCrit: number
}

// dashline's own defaults, keyed by settings key so a component can resolve one threshold
// without restating the numbers. `DEFAULT_THRESHOLDS` is derived so there is one literal.
export const THRESHOLD_DEFAULTS: Record<ThresholdKey, number> = {
  contextWarningAt: 40,
  contextCriticalAt: 50,
  usageWarningAt: 70,
  usageCriticalAt: 90,
}

const DEFAULT_THRESHOLDS: PctThresholds = {
  contextWarn: THRESHOLD_DEFAULTS.contextWarningAt,
  contextCrit: THRESHOLD_DEFAULTS.contextCriticalAt,
  usageWarn: THRESHOLD_DEFAULTS.usageWarningAt,
  usageCrit: THRESHOLD_DEFAULTS.usageCriticalAt,
}

// The value a threshold actually takes: the setting, or dashline's default when unset.
export function effectiveThreshold(settings: Settings, k: ThresholdKey): number {
  return settings[k] || THRESHOLD_DEFAULTS[k]
}

export function resolveThresholds(s: Settings): PctThresholds {
  return {
    contextWarn: s.contextWarningAt || DEFAULT_THRESHOLDS.contextWarn,
    contextCrit: s.contextCriticalAt || DEFAULT_THRESHOLDS.contextCrit,
    usageWarn: s.usageWarningAt || DEFAULT_THRESHOLDS.usageWarn,
    usageCrit: s.usageCriticalAt || DEFAULT_THRESHOLDS.usageCrit,
  }
}

// Percent tone by load against the active thresholds, so colors shift green → yellow → red as a
// scenario fills up and respond to the threshold sliders.
function toneFor(value: number, kind: 'context' | 'usage', th: PctThresholds): ColorName {
  const warn = kind === 'context' ? th.contextWarn : th.usageWarn
  const crit = kind === 'context' ? th.contextCrit : th.usageCrit
  if (value >= crit) return 'red'
  if (value >= warn) return 'yellow'
  return 'green'
}

// The live percent state for a widget: the static sample, or the scenario's values recolored
// and re-tokenized so the numbers stay believable as they move.
function resolvePercent(widget: string, scenario: Scenario | undefined, th: PctThresholds): PercentState | null {
  const base = PERCENT[widget]
  if (!base) return null
  if (!scenario) return base
  const value = widget === 'context' ? scenario.context : widget === 'session' ? scenario.session : scenario.weekly
  const tone = toneFor(value, widget === 'context' ? 'context' : 'usage', th)
  if (widget === 'context') {
    const usedK = Math.max(1, Math.round((value / 100) * 1000))
    return {
      value,
      tone,
      ratio: `${usedK}k/1.0M`,
      left: `${Math.max(0, 1000 - usedK)}k left`,
      defaultBar: true,
      detail: [[` (${usedK}k/1.0M)`, 'dim'], [` · ${scenario.effort ?? 'high'}`, tone]],
    }
  }
  if (widget === 'session') {
    return { value, tone, detail: [[` (↻${scenario.reset ?? '2h11m'})`, 'dim']] }
  }
  return { value, tone, detail: [[' (↻3d16h)', 'dim']] }
}

// The default (no-variant) look of a live widget, rebuilt from a scenario so playback moves the
// numbers, bars, and colors even when the user hasn't chosen an explicit variant.
// A cross-session total. Only the windows: the session path is left alone so a plain `cost`
// still takes its figure from the scenario, exactly as before.
const COST_SAMPLE = { week: 41.8, month: 128.4 } as const

function costParts(item: Item): Part[] | null {
  if (item.widget !== 'cost' || (item.period !== 'week' && item.period !== 'month')) return null
  const usd = COST_SAMPLE[item.period]
  if (item.variant === 'cents') return [[`${Math.round(usd * 100)}c`, 'green']]
  if (item.variant === 'round') return [[`$${Math.round(usd)}`, 'green']]
  return [[`$${usd.toFixed(2)}`, 'green']]
}

function scenarioParts(widget: string, scenario: Scenario | undefined): Part[] | null {
  if (!scenario) return null
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

// Mirrors dashline's percent presenter exactly: the reductive variants draw only their
// own part, with no label and no trailing detail. Getting this wrong makes the preview
// lie about what the terminal will print, which is the one thing it must not do.
function percentParts(item: Item, scenario: Scenario | undefined, th: PctThresholds): Part[] | null {
  const s = resolvePercent(item.widget, scenario, th)
  if (!s) return null
  const pct = `${s.value}%`
  const style = item.bar ?? 'blocks'

  switch (item.variant) {
    case 'pct':
      return [[pct, s.tone]]
    case 'bar':
      return [[drawBar(s.value, style), s.tone]]
    case 'gauge':
      return [[`▕${drawBar(s.value, style)}▏`, s.tone]]
    // Both fall back to the plain number where there is no token span, and the fallback keeps
    // the value's own tone rather than the dim the bracketed form uses.
    case 'ratio':
      return [[s.ratio ?? pct, s.tone]]
    case 'tokens':
      return s.ratio ? [[`(${s.ratio})`, 'dim']] : [[pct, s.tone]]
    case 'left':
      // Only the context window has a size to subtract from; the rest fall back.
      return [[s.left ?? pct, s.tone]]
    case 'history':
      return [['▁▂▃▅▇▆', s.tone]]
  }

  // No variant: label, number, the trend arrow, the bar when the widget draws one by default
  // or one was asked for, then the trailing detail (tokens, hint, countdown). This is the part
  // order of present/percent.ts, and it has to stay that order — the arrow sits between the
  // number and the meter there, not after them.
  const parts: Part[] = [[pct, s.tone]]
  // The arrow compares against session history, which only the context window keeps, so the
  // core gates it on `d.scale === "context"` and the usage widgets ignore the option.
  if (item.trend && item.widget === 'context') parts.push([' ↑', 'green'])
  if (s.defaultBar || item.bar) parts.push([` ${drawBar(s.value, style)}`, s.tone])
  return [...parts, ...s.detail]
}

// The colored parts a placed item renders, applying its variant, bar, label, and trend. An
// optional scenario overrides the live values so the terminal preview can play through states.
export function widgetParts(item: Item, scenario?: Scenario, th: PctThresholds = DEFAULT_THRESHOLDS): Part[] {
  // With no content yet — in the palette, or before anything is typed — the sample from
  // the widget's metadata stands in, so the row is never blank.
  if (item.widget === TEXT_ITEM) {
    return item.text ? [[item.text, item.color ?? 'white']] : (WIDGETS[TEXT_ITEM]?.parts ?? [])
  }
  // The real output is whatever the command prints, which the browser cannot know; the
  // command line itself stands in for it.
  if (item.widget === COMMAND_ITEM) {
    return item.text ? [[item.text, 'dim']] : (WIDGETS[COMMAND_ITEM]?.parts ?? [])
  }

  const meta = WIDGETS[item.widget]
  const chosen = item.variant ? meta?.variants?.[item.variant] : undefined
  // The icon and the label are not applied here — present() draws those around whatever this
  // returns, for every kind alike. See chromeOf.
  const base = percentParts(item, scenario, th) ?? costParts(item) ?? chosen ?? scenarioParts(item.widget, scenario) ?? meta?.parts ?? []
  const parts = base.map((p) => [...p] as Part)
  if (!isLabelKind(item.widget)) return parts

  // label.ts transforms the text it was given, so these run after the widget's own variant has
  // chosen what to draw, and across the parts as one string — truncating each part separately
  // would give one ellipsis per part.
  const joined = parts.map(([t]) => t).join('')
  let text = transform(joined, item.variant)
  if (item.truncate && item.truncate > 0) text = clip(text, item.truncate)
  if (text === joined) return parts
  // A transform collapses the parts into one, since it can no longer say which colour a
  // character came from. Label widgets draw in a single colour anyway.
  return [[text, parts[0]?.[1] ?? 'white']]
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

// One placed item, as it appears in the config: a bare widget name, [name, { options }],
// a { text } object, or a bare command string.
function itemToConfig(it: Item): string | [string, Record<string, unknown>] | Record<string, unknown> {
  if (it.widget === TEXT_ITEM) {
    const text: Record<string, unknown> = { text: it.text ?? '' }
    // dashline honours only color and bg on a literal; the rest would be ignored.
    if (it.color) text.color = it.color
    return text
  }
  if (it.widget === COMMAND_ITEM) return it.text ?? ''

  const opts: Record<string, unknown> = {}
  if (it.color) opts.color = it.color
  if (it.label) opts.label = it.label
  if (it.variant) opts.variant = it.variant
  if (it.bar) opts.bar = it.bar
  if (it.trend) opts.trend = true
  if (it.period && it.period !== 'session') opts.period = it.period
  if (it.truncate) opts.truncate = it.truncate
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
  if (typeof opts.period === 'string' && (PERIODS as readonly string[]).includes(opts.period)) item.period = opts.period as Period
  if (typeof opts.truncate === 'number' && opts.truncate > 0) item.truncate = opts.truncate
  if (typeof opts.icon === 'string') item.icon = opts.icon
  if (opts.bold === true) item.bold = true
  if (opts.italic === true) item.italic = true
  if (opts.underline === true) item.underline = true
}

function parseItem(raw: unknown): Item | null {
  // A bare string is a widget when it names one, and a shell command otherwise —
  // the same rule dashline applies when it renders.
  if (typeof raw === 'string') {
    return WIDGETS[raw] && !isCustom(raw) ? { widget: raw } : { widget: COMMAND_ITEM, text: raw }
  }
  if (Array.isArray(raw)) {
    const [name, second] = raw
    if (typeof name !== 'string') return null
    const item: Item = { widget: name }
    if (typeof second === 'string') item.color = second as ColorName
    else if (second && typeof second === 'object') applyOpts(item, second as Record<string, unknown>)
    return item
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (typeof o.text !== 'string') return null
    const item: Item = { widget: TEXT_ITEM, text: o.text }
    if (typeof o.color === 'string') item.color = o.color as ColorName
    return item
  }
  return null
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
