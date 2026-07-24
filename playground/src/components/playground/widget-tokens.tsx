import { ICONS, colorOf, widgetParts, type Item, type PctThresholds, type Scenario } from '@/lib/dashline'

interface WidgetTokensProps {
  id: string
  item?: Item
  theme?: string
  icons?: boolean
  scenario?: Scenario
  thresholds?: PctThresholds
}

// Renders a widget's sample output with its palette colors and any per-item options. Shared by
// the palette, the terminal preview, and the widgets reference so they all read identically. A
// scenario (terminal preview only) swaps in live-changing values for playback, and thresholds
// color the percentages the way the current settings would.
export function WidgetTokens({ id, item, theme = '', icons = false, scenario, thresholds }: WidgetTokensProps) {
  const resolved: Item = item ?? { widget: id }
  const parts = widgetParts(resolved, scenario, thresholds)
  if (!parts.length) return null
  // A per-item icon wins over the global default, and shows even when global icons are off.
  const glyph = resolved.icon || (icons && ICONS[id] ? ICONS[id] : '')
  // italic/underline ride the wrapper (they inherit); weight is per-part so the "bold" color's
  // own semibold survives unless the item is explicitly bold.
  const attrs = {
    fontStyle: resolved.italic ? 'italic' : undefined,
    textDecoration: resolved.underline ? 'underline' : undefined,
  }
  return (
    <span className="whitespace-pre" style={attrs}>
      {glyph ? <span style={{ color: colorOf('dim', theme), fontWeight: resolved.bold ? 700 : undefined }}>{glyph} </span> : null}
      {parts.map(([text, c], i) => {
        const color = resolved.color ?? c
        return (
          <span key={i} style={{ color: colorOf(color, theme), fontWeight: resolved.bold ? 700 : c === 'bold' ? 600 : 400 }}>
            {text}
          </span>
        )
      })}
    </span>
  )
}
