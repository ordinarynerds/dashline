import { COMMAND_ITEM, TEXT_ITEM, type Item, type ItemOption, type Line, type Settings } from './dashline'

// Complete status lines you can apply in one click. A preset is not a recipe: RECIPES.md
// teaches one technique at a time in prose, while a preset is a finished configuration
// someone would actually run.
//
// A preset always replaces `lines`. It touches a setting only when it names one — the two
// styling presets do, and nothing else does — so applying one never quietly undoes the
// theme or thresholds you picked.
export interface Preset {
  id: string
  name: string
  desc: string
  lines: Line[]
  settings?: Partial<Settings>
}

export interface PresetGroup {
  label: string
  presets: Preset[]
}

// A widget name, or a name with the options it carries — the same two shapes the config
// itself accepts, so a preset reads like the JSON it produces.
type Spec = string | [string, ItemOption]

const item = (s: Spec): Item => (typeof s === 'string' ? { widget: s } : { widget: s[0], ...s[1] })

const row = (left: Spec[], center: Spec[] = [], right: Spec[] = []): Line => ({
  left: left.map(item),
  center: center.map(item),
  right: right.map(item),
})

// The two custom items don't take a widget name, so they're built directly.
const text = (value: string, color: Item['color']): Spec => [TEXT_ITEM, { text: value, color }] as [string, ItemOption]
const command = (line: string): Spec => [COMMAND_ITEM, { text: line }] as [string, ItemOption]

export const PRESET_GROUPS: PresetGroup[] = [
  {
    label: 'Starters',
    presets: [
      {
        id: 'default',
        name: 'Default',
        desc: 'What dashline ships with — context on the left, plan usage on the right.',
        lines: [row(['branch', 'model', 'context'], [], ['session', 'weekly'])],
      },
      {
        id: 'minimal',
        name: 'Minimal',
        desc: 'One row, one meter, nothing you did not ask for.',
        lines: [row(['model', ['context', { variant: 'bar' }]])],
      },
      {
        id: 'three-zones',
        name: 'Three zones',
        desc: 'Left, centre and right spread across the full width of the terminal.',
        lines: [row(['branch', 'model'], ['context'], ['session', 'weekly'])],
      },
    ],
  },
  {
    label: 'Meters',
    presets: [
      {
        id: 'bars',
        name: 'Bars only',
        desc: 'Every meter drawn and no percentages, to be read at a glance.',
        lines: [
          row(
            ['branch', ['context', { variant: 'bar' }]],
            [],
            [
              ['session', { variant: 'bar' }],
              ['weekly', { variant: 'bar' }],
            ],
          ),
        ],
      },
      {
        id: 'numbers',
        name: 'Numbers only',
        desc: 'Percentages with the meters dropped, for a narrow terminal.',
        lines: [row(['branch', ['context', { variant: 'pct' }], ['session', { variant: 'pct' }]])],
      },
      {
        id: 'fine',
        name: 'Fine bars',
        desc: 'Meters that step in eighths of a cell, for a smoother edge.',
        lines: [
          row(
            ['branch', ['context', { bar: 'fine' }]],
            [],
            [
              ['session', { bar: 'fine' }],
              ['weekly', { bar: 'fine' }],
            ],
          ),
        ],
      },
      {
        id: 'shaded',
        name: 'Shaded',
        desc: 'A softer ▓░ fill than the solid blocks, for a bright terminal.',
        lines: [
          row(
            ['branch', ['context', { bar: 'shade' }]],
            [],
            [
              ['session', { bar: 'shade' }],
              ['weekly', { bar: 'shade' }],
            ],
          ),
        ],
      },
      {
        id: 'ascii',
        name: 'ASCII safe',
        desc: 'Hashes and brackets only — nothing here needs a font with box-drawing glyphs.',
        lines: [row(['branch', ['context', { bar: 'ascii' }]], [], [['session', { bar: 'ascii' }]])],
      },
      {
        id: 'hairline',
        name: 'Hairline',
        desc: 'A single rule in place of blocks: the quietest meter dashline draws.',
        lines: [
          row(
            ['branch', ['context', { bar: 'line' }]],
            [],
            [
              ['session', { bar: 'line' }],
              ['weekly', { bar: 'line' }],
            ],
          ),
        ],
      },
      {
        id: 'gauges',
        name: 'Gauges',
        desc: 'Bracketed meters, so each one keeps its ends visible against the text.',
        lines: [
          row(
            ['branch', ['context', { variant: 'gauge' }]],
            [],
            [
              ['session', { variant: 'gauge' }],
              ['weekly', { variant: 'gauge' }],
            ],
          ),
        ],
      },
    ],
  },
  {
    label: 'Usage & cost',
    presets: [
      {
        id: 'headroom',
        name: 'Headroom',
        desc: 'How much context is left, and how long before it runs out.',
        lines: [row(['branch', 'model'], [], [['context', { variant: 'left' }], 'burn'])],
      },
      {
        id: 'cost',
        name: 'Cost watch',
        desc: 'Spend so far, spend per hour, and the PR it is going into.',
        lines: [row(['branch', 'pr'], [], ['cost', 'rate', 'session'])],
      },
      {
        id: 'session',
        name: 'Session tracker',
        desc: 'Which session this is, how long it has run, and what it has used.',
        lines: [row(['name', 'duration'], [], ['session', 'weekly', 'cost'])],
      },
      {
        id: 'tokens',
        name: 'Token count',
        desc: 'The raw token span instead of a percentage, for when the number is the point.',
        lines: [row(['branch', 'model'], [], [['context', { variant: 'ratio' }], 'session'])],
      },
      {
        id: 'trend',
        name: 'Trend',
        desc: 'An arrow beside the context window showing which way it has been moving.',
        lines: [row(['branch', ['context', { trend: true }]], [], ['session'])],
      },
      {
        id: 'sparkline',
        name: 'Sparkline',
        desc: 'The last few context readings drawn as a tiny chart.',
        lines: [row(['branch', 'model'], [], [['context', { variant: 'history' }], 'session'])],
      },
      {
        id: 'rounded',
        name: 'Round numbers',
        desc: 'Spend to the nearest dollar an hour — a glance, not a ledger.',
        lines: [row(['branch', 'model'], [], ['cost', ['rate', { variant: 'round' }], 'duration'])],
      },
    ],
  },
  {
    label: 'Git',
    presets: [
      {
        id: 'repo',
        name: 'Repo pulse',
        desc: 'The working tree at a glance: changes, sync state, stash and HEAD.',
        lines: [row(['branch', 'dirty', 'sync'], [], ['stash', 'sha'])],
      },
      {
        id: 'review',
        name: 'Review queue',
        desc: 'For working through a pull request — its number, its state, its size.',
        lines: [row(['branch', 'pr', 'review'], [], [['lines', { variant: 'pair' }]])],
      },
      {
        id: 'worktrees',
        name: 'Worktrees',
        desc: 'For juggling several checkouts of one repo without losing track of which is which.',
        lines: [row(['worktree', 'branch', ['dirty', { variant: 'flags' }]], [], ['cwd'])],
      },
      {
        id: 'identity',
        name: 'Full identity',
        desc: 'owner/repo spelled out, for when several projects are open at once.',
        lines: [row([['repo', { variant: 'full' }], 'branch', 'sha'], [], ['dirty'])],
      },
      {
        id: 'diffsize',
        name: 'Diff size',
        desc: 'How large the working change has grown — added against removed, and the net.',
        lines: [row(['branch', ['diff', { variant: 'pair' }]], [], [['lines', { variant: 'sum' }]])],
      },
      {
        id: 'pushstate',
        name: 'Push state',
        desc: 'Commits waiting to push and waiting to pull, split apart instead of combined.',
        lines: [
          row(['branch', ['sync', { variant: 'ahead' }], ['sync', { variant: 'behind' }]], [], ['stash', 'sha']),
        ],
      },
    ],
  },
  {
    label: 'Session & machine',
    presets: [
      {
        id: 'agent',
        name: 'Agent watch',
        desc: 'Model, reasoning effort, and which subagent is currently running.',
        lines: [row(['model', 'effort', 'agent'], [], [['context', { variant: 'gauge' }]])],
      },
      {
        id: 'remote',
        name: 'Remote desk',
        desc: 'Which machine, which directory, what time — for sessions over ssh.',
        lines: [row([['host', { variant: 'ssh' }], 'cwd'], [], ['time', 'version'])],
      },
      {
        id: 'tagged',
        name: 'Tagged',
        desc: 'A literal label pinned to the front, for telling two terminals apart.',
        lines: [row([text('api', 'cyan'), 'branch', 'model', 'context'], [], ['session'])],
      },
      {
        id: 'modes',
        name: 'Mode watch',
        desc: 'Every mode indicator Claude Code exposes, gathered into one row.',
        lines: [row(['model', 'effort'], [], ['vim', 'fast', 'thinking'])],
      },
      {
        id: 'stopwatch',
        name: 'Stopwatch',
        desc: 'Seconds on the clock and time elapsed, for when you are timing a run.',
        lines: [row([['time', { variant: 'seconds' }], 'duration'], [], ['host', 'version'])],
      },
      {
        id: 'named',
        name: 'Session id',
        desc: 'The bare id rather than the generated name, for matching a terminal to a transcript.',
        lines: [row([['name', { variant: 'id' }], 'output'], [], ['duration', 'cost'])],
      },
    ],
  },
  {
    label: 'Styling',
    presets: [
      {
        id: 'powerline',
        name: 'Powerline',
        desc: 'Segmented backgrounds, the way a powerline prompt draws. Turns powerline on.',
        lines: [row(['branch', 'model', 'context'], [], ['session'])],
        settings: { powerline: true },
      },
      {
        id: 'icons',
        name: 'Nerd Fonts',
        desc: 'Every widget that takes a glyph gets one. Turns icons on; needs a Nerd Font installed.',
        lines: [row(['branch', 'model', 'cwd'], [], ['dirty', 'sync', 'sha'])],
        settings: { icons: true },
      },
      {
        id: 'emphasis',
        name: 'Emphasis',
        desc: 'Bold, italic and underline, one on each of three widgets.',
        lines: [
          row(
            [['branch', { bold: true }], ['model', { italic: true }], ['cwd', { underline: true }]],
            [],
            ['session'],
          ),
        ],
      },
      {
        id: 'palette',
        name: 'Colour coded',
        desc: 'Every item given a colour of its own, overriding what the widget picked.',
        lines: [
          row(
            [['branch', { color: 'magenta' }], ['model', { color: 'cyan' }], ['context', { color: 'blue' }]],
            [],
            [['session', { color: 'green' }]],
          ),
        ],
      },
      {
        id: 'glyphs',
        name: 'Your own glyphs',
        desc: 'A chosen character in front of each widget — no Nerd Font needed.',
        lines: [
          row(
            [['branch', { icon: '⌥' }], ['model', { icon: '✦' }], ['cwd', { icon: '▸' }]],
            [],
            [['sha', { icon: '◈' }]],
          ),
        ],
      },
      {
        id: 'renamed',
        name: 'Short labels',
        desc: 'A label replaces the one the widget ships with: 5h and week, not session and All.',
        lines: [row(['branch', 'context'], [], [['session', { label: '5h' }], ['weekly', { label: 'week' }]])],
      },
    ],
  },
  {
    label: 'Multi-line',
    presets: [
      {
        id: 'stacked',
        name: 'Split rows',
        desc: 'Git on the top row and usage on the bottom, so neither has to be trimmed.',
        lines: [row(['branch', 'dirty', 'sync'], [], ['sha']), row(['model', 'context'], [], ['session', 'weekly'])],
      },
      {
        id: 'command',
        name: 'Your own tool',
        desc: 'A second row that runs a shell command and draws its first line of output.',
        lines: [row(['branch', 'context'], [], ['session', 'weekly']), row([command('git log -1 --pretty=%s')])],
      },
      {
        id: 'threerows',
        name: 'Three rows',
        desc: 'Git, model and usage each given a row, so nothing has to be abbreviated.',
        lines: [
          row(['branch', 'dirty', 'sync'], [], ['sha', 'stash']),
          row(['model', 'effort'], [], ['agent']),
          row(['context'], [], ['session', 'weekly', 'cost']),
        ],
      },
      {
        id: 'taggedrows',
        name: 'Tagged rows',
        desc: 'A coloured tag at the head of each row, so a stacked line stays scannable.',
        lines: [
          row([text('git', 'cyan'), 'branch', ['dirty', { variant: 'flags' }]], [], ['sha']),
          row([text('use', 'magenta'), 'context'], [], ['session', 'weekly']),
        ],
      },
    ],
  },
]

export const PRESETS: Preset[] = PRESET_GROUPS.flatMap((g) => g.presets)
