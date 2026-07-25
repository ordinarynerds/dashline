import { POWERLINE_BG, ZONES, colorOf, type Line, type PctThresholds, type Settings } from '@/lib/dashline'
import { cn } from '@/lib/utils'
import { WidgetTokens } from './widget-tokens'
import { SOLO_ZONE, ZONE_BOX, isSolo, lineBox, separatorOf } from './line-geometry'

interface LinePreviewProps {
  line: Line
  settings: Settings
  thresholds: PctThresholds
}

// One status line drawn exactly as dashline would print it, with no editing affordances. Used
// wherever a line has to be shown rather than built — the preset gallery today.
export function LinePreview({ line, settings, thresholds }: LinePreviewProps) {
  const solo = isSolo(line)
  const separator = separatorOf(settings)

  return (
    // dashline composes every line into `columns - margin`, so a preview has to lose the same
    // columns off the right or the margin setting looks inert.
    <span className={cn(lineBox(line), 'whitespace-pre')} style={{ paddingRight: `${settings.margin}ch` }}>
      {(solo ? SOLO_ZONE : ZONES).map((z) => (
        <span key={z} className={cn(ZONE_BOX[z], solo && 'flex-1', 'items-center whitespace-pre')}>
          {line[z].map((item, i) => (
            <span key={i} className="inline-flex items-center whitespace-pre">
              {/* Powerline draws its own boundaries with the segment backgrounds, so the
                  separator would double up. */}
              {i > 0 && !settings.powerline && (
                <span aria-hidden style={{ color: colorOf('dim', settings.theme) }}>
                  {separator}
                </span>
              )}
              <span
                className={settings.powerline ? 'px-2' : undefined}
                style={settings.powerline ? { backgroundColor: POWERLINE_BG[i % POWERLINE_BG.length] } : undefined}
              >
                <WidgetTokens
                  id={item.widget}
                  item={item}
                  theme={settings.theme}
                  icons={settings.icons}
                  thresholds={thresholds}
                />
              </span>
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}
