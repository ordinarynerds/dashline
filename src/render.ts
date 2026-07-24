import type { DashlineConfig, Item, LineSpec } from './config.ts'
import type { Ctx, WidgetOpts } from './widgets/types.ts'
import { registry } from './widgets/registry.ts'
import { present } from './present/index.ts'
import { compose } from './layout.ts'
import { paint, isStyle, sanitize } from './style.ts'

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
  const left = renderZone(zones.left, ctx, sep)
  const center = renderZone(zones.center, ctx, sep)
  const right = renderZone(zones.right, ctx, sep)
  if (!left && !center && !right) return null
  return compose(left, center, right, columns, config.margin)
}

function renderZone(items: Item[] | undefined, ctx: Ctx, sep: string): string {
  if (!items) return ''
  const parts: string[] = []
  for (const item of items) {
    const rendered = renderItem(item, ctx)
    if (rendered) parts.push(rendered)
  }
  return parts.join(sep)
}

function renderItem(item: Item, ctx: Ctx): string | null {
  if (typeof item === 'object' && !Array.isArray(item)) {
    if (!item.text) return null
    const text = sanitize(item.text)
    return item.color ? paint(text, item.color) : text
  }

  const [id, raw] = Array.isArray(item) ? item : [item, undefined]
  const opts: WidgetOpts =
    typeof raw === 'string' ? (isStyle(raw) ? { color: raw } : { variant: raw }) : (raw ?? {})

  const widget = registry[id]
  if (!widget) return ctx.commands?.get(id) ?? null

  const datum = widget.data(ctx, opts)
  if (!datum) return null
  const out = present(datum, opts, ctx)
  return out == null || out === '' ? null : out
}
