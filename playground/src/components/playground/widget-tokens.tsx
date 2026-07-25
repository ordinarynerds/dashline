import { chromeOf, colorOf, widgetParts, type Item, type PctThresholds, type Scenario } from '@/lib/dashline'

// The type treatment a widget's output gets everywhere it appears — the palette, the
// placed chips, the terminal preview. Shared so the three can never drift apart, which
// would make the builder misrepresent the width of what it is building.
export const PREVIEW_TYPE = 'font-mono text-[13px] leading-5 whitespace-pre'

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
  // The core's precedence, from render.ts and present/label.ts: an explicit item icon beats the
  // global Nerd Font glyph, which beats an icon the widget carries in its own datum. That last
  // one is not gated on the icons setting — `branch` prints its ⎇ either way — so leaving it
  // out drew the default status line one glyph short of what the terminal shows. And none of
  // the three reaches a widget whose presenter discards the option.
  // The icon and the label sit outside `parts` because a per-item `color` must not recolour
  // them: present() paints chrome from the datum's icon colour and dim, never from opts.color.
  const chrome = chromeOf(resolved, icons)
  // italic/underline ride the wrapper (they inherit); weight is per-part so the "bold" color's
  // own semibold survives unless the item is explicitly bold.
  const attrs = {
    fontStyle: resolved.italic ? 'italic' : undefined,
    textDecoration: resolved.underline ? 'underline' : undefined,
  }
  return (
    <span className="whitespace-pre" style={attrs}>
      {chrome.icon ? (
        <span style={{ color: colorOf(chrome.iconColor, theme), fontWeight: resolved.bold ? 700 : undefined }}>
          {chrome.icon}{' '}
        </span>
      ) : null}
      {chrome.label ? (
        <span style={{ color: colorOf('dim', theme), fontWeight: resolved.bold ? 700 : undefined }}>
          {chrome.label}{' '}
        </span>
      ) : null}
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
