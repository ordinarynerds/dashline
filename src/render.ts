import type { DashlineConfig, Item, LineSpec } from './config.ts'
import type { Ctx, WidgetOpts } from './widgets/types.ts'
import { registry } from './widgets/registry.ts'
import { present } from './present/index.ts'
import { compose } from './layout.ts'
import { powerlineZone } from './powerline.ts'
import { paint, isStyle, sanitize, bgCode } from './style.ts'

// Default Nerd Font glyphs per widget, enabled by `icons: true`. An explicit item icon
// always wins. Written as code points so no glyphs sit in the source.
const ICONS: Record<string, string> = Object.fromEntries(
  (
    [
      ['branch', 0xe0a0],
      ['model', 0xf0e7],
      ['cwd', 0xf07b],
      ['repo', 0xf401],
      ['pr', 0xf407],
      ['review', 0xf407],
      ['worktree', 0xf1bb],
      ['version', 0xf02b],
      ['name', 0xf2c1],
      ['effort', 0xf0e4],
      ['output', 0xf013],
      ['cost', 0xf155],
    ] as const
  ).map(([id, cp]) => [id, String.fromCodePoint(cp)]),
)

export function render(config: DashlineConfig, ctx: Ctx, columns: number): string[] {
  const sep = ` ${paint(sanitize(config.separator), 'dim')} `
  const out: string[] = []
  for (const line of config.lines) {
    const rendered = renderLine(line, ctx, config, columns, sep)
    if (rendered !== null) out.push(rendered)
  }
  return out
}

function renderLine(line: LineSpec, ctx: Ctx, config: DashlineConfig, columns: number, sep: string): string | null {
  const zones = Array.isArray(line) ? { left: line } : line
  const left = renderZone(zones.left, ctx, sep, config, 'left')
  const center = renderZone(zones.center, ctx, sep, config, 'left')
  const right = renderZone(zones.right, ctx, sep, config, 'right')
  if (!left && !center && !right) return null
  return compose(left, center, right, columns, config.margin)
}

function renderZone(items: Item[] | undefined, ctx: Ctx, sep: string, config: DashlineConfig, direction: 'left' | 'right'): string {
  if (!items) return ''
  const segs: { text: string; bg: string | null }[] = []
  for (const item of items) {
    const text = renderItem(item, ctx, config.icons)
    if (!text) continue
    const word = itemBg(item)
    segs.push({ text, bg: word ? bgCode(word) : null })
  }
  if (segs.length === 0) return ''
  return config.powerline ? powerlineZone(segs, direction) : segs.map((s) => s.text).join(sep)
}

function itemBg(item: Item): string | undefined {
  if (typeof item === 'string') return undefined
  if (Array.isArray(item)) return typeof item[1] === 'object' ? item[1].bg : undefined
  return item.bg
}

function renderItem(item: Item, ctx: Ctx, icons: boolean): string | null {
  if (typeof item === 'object' && !Array.isArray(item)) {
    if (!item.text) return null
    const text = sanitize(item.text)
    return item.color || item.bg ? paint(text, item.color, item.bg) : text
  }

  const [id, raw] = Array.isArray(item) ? item : [item, undefined]
  let opts: WidgetOpts =
    typeof raw === 'string' ? (isStyle(raw) ? { color: raw } : { variant: raw }) : (raw ?? {})

  const widget = registry[id]
  if (!widget) return ctx.commands?.get(id) ?? null

  if (icons && !opts.icon && ICONS[id]) opts = { ...opts, icon: ICONS[id] }

  try {
    const datum = widget.data(ctx, opts)
    if (!datum) return null
    const out = present(datum, opts, ctx)
    return out == null || out === '' ? null : out
  } catch {
    return null // a single bad item drops itself, not the whole line
  }
}
