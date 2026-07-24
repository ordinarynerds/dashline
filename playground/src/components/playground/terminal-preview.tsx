import { POWERLINE_BG, SCENARIOS, colorOf, type Item, type Line, type Scenario, type Settings } from '@/lib/dashline'
import { ClaudePrompt } from '@/components/brainless/claude/claude-prompt'
import { WidgetTokens } from './widget-tokens'
import { TerminalScrollback } from './terminal-scrollback'
import { usePlaygroundContext } from './context'
import { usePreviewStore } from '@/hooks/use-preview-store'

// Ghost the scrollback with a full-height ramp: near-invisible up top, only the last lines
// readable, so the status line and input at the bottom are what the eye lands on first.
const FADE = 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.12) 55%, #000 100%)'

function Token({ item, settings, scenario }: { item: Item; settings: Settings; scenario: Scenario }) {
  return <WidgetTokens id={item.widget} item={item} theme={settings.theme} icons={settings.icons} scenario={scenario} />
}

function ZoneTokens({ items, settings, scenario }: { items: Item[]; settings: Settings; scenario: Scenario }) {
  if (!items.length) return null
  if (settings.powerline) {
    return (
      <span className="flex">
        {items.map((item, i) => (
          <span key={i} className="whitespace-pre px-2" style={{ backgroundColor: POWERLINE_BG[i % POWERLINE_BG.length] }}>
            <Token item={item} settings={settings} scenario={scenario} />
          </span>
        ))}
      </span>
    )
  }
  const sep = settings.separator || ' · '
  return (
    <span className="flex whitespace-pre">
      {items.map((item, i) => (
        <span key={i} className="flex whitespace-pre">
          {i > 0 ? <span style={{ color: colorOf('dim', settings.theme) }}>{sep}</span> : null}
          <Token item={item} settings={settings} scenario={scenario} />
        </span>
      ))}
    </span>
  )
}

function StatusLine({ line, settings, scenario }: { line: Line; settings: Settings; scenario: Scenario }) {
  if (!line.center.length && !line.right.length) {
    return (
      <div className="flex whitespace-pre">
        <ZoneTokens items={line.left} settings={settings} scenario={scenario} />
      </div>
    )
  }
  return (
    <div className="flex whitespace-pre">
      <div className="flex">
        <ZoneTokens items={line.left} settings={settings} scenario={scenario} />
      </div>
      <div className="flex flex-1 justify-center">
        <ZoneTokens items={line.center} settings={settings} scenario={scenario} />
      </div>
      <div className="flex flex-1 justify-end">
        <ZoneTokens items={line.right} settings={settings} scenario={scenario} />
      </div>
    </div>
  )
}

// The terminal mock: a faded scrollback of session output, the dashline status line, and Claude
// Code's own prompt pinned to the bottom, on a black surface. The status line renders the
// currently selected sample scenario so it can be played through different states.
export function TerminalPreview() {
  const { lines, settings } = usePlaygroundContext()
  const index = usePreviewStore((s) => s.index)
  const scenario = SCENARIOS[index]
  return (
    <div className="flex h-full flex-col overflow-hidden bg-black p-4 font-mono text-[13px] leading-relaxed">
      <div
        className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden opacity-60"
        style={{ maskImage: FADE, WebkitMaskImage: FADE }}
      >
        <TerminalScrollback />
      </div>
      <div className="mt-3 shrink-0">
        <ClaudePrompt mode="auto" effort={false} placeholder="Try a task…" />
      </div>
      <div className="mt-2 flex shrink-0 flex-col gap-1">
        {lines.map((ln, i) => (
          <StatusLine key={i} line={ln} settings={settings} scenario={scenario} />
        ))}
      </div>
    </div>
  )
}
