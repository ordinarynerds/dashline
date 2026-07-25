import { resolveThresholds, type Line, type Settings } from '@/lib/dashline'
import { PRESET_GROUPS, type Preset } from '@/lib/presets'
import { cn } from '@/lib/utils'
import { PREVIEW_TYPE } from './widget-tokens'
import { LinePreview } from './line-preview'
import { usePlaygroundContext } from './context'

// You are on a preset when it would change nothing: the same items in the same places, and any
// setting it claims already in effect. The settings half matters because presets can share a
// layout — Nerd Fonts is Default plus icons, and marking it current with icons off would point
// at the one configuration you are not in.
//
// Item objects are built the same way whether they came from a preset or from a drag, so
// comparing the serialised lines is enough. A miss only costs the marker, never correctness.
function isCurrent(preset: Preset, lines: Line[], settings: Settings): boolean {
  if (JSON.stringify(preset.lines) !== JSON.stringify(lines)) return false
  return Object.entries(preset.settings ?? {}).every(([k, v]) => settings[k as keyof Settings] === v)
}

// Motion with a little mass to it, rather than a linear colour swap.
const EASE = 'transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]'

// Three steps of value, so the nesting is legible: the panel behind (#0c0c0e), the tray a clear
// step above it, and the plate at pure black well below both. The theme's own --accent and
// --border are the same #1c1c20, so a token border can never draw an edge against a token
// surface — these are white overlays instead, the idiom the terminal chrome already uses.
const TRAY = {
  rest: 'border-white/[0.07] bg-white/[0.04]',
  hover: 'hover:border-white/20 hover:bg-white/[0.08]',
  // Tinted rather than darkened, so the selected card keeps the same weight as its neighbours
  // instead of sinking into the background.
  active: 'border-[#4ec9d6]/70 bg-[#4ec9d6]/[0.12]',
}

// A preset, shown as the line it produces.
//
// The card is a tray and the preview is a plate seated in it. That nesting is doing real work:
// a full-bleed black strip runs straight into its neighbours, so nineteen of them stack into
// one striped wall with no way to tell where a preset starts. Held inside a lighter frame with
// air around it, each one reads as a single object — the label and the line it belongs to.
//
// The plate keeps the terminal's own treatment: black, monospace, square, at the width the
// line will really have. Only the tray is interface.
function PresetCard({ preset, active, onApply }: { preset: Preset; active: boolean; onApply: () => void }) {
  const { settings } = usePlaygroundContext()
  // Preview under the settings you are currently using, plus whatever this preset would
  // change — otherwise the powerline preset would preview flat and lie about itself.
  const merged = { ...settings, ...preset.settings }
  const thresholds = resolveThresholds(merged)

  return (
    <button
      type="button"
      onClick={onApply}
      data-preset={preset.id}
      aria-label={`Apply the ${preset.name} preset`}
      aria-current={active || undefined}
      className={cn(
        // Square, like the palette rows and the pills in the terminal: this frames a preview of
        // terminal content, so it should not round what the terminal never rounds.
        'group/preset block w-full cursor-pointer border p-1.5 text-left',
        'focus-visible:ring-ring/50 outline-none focus-visible:ring-2',
        EASE,
        active ? TRAY.active : cn(TRAY.rest, TRAY.hover),
      )}
    >
      <span className="flex items-baseline gap-2 px-0.5 pb-1.5">
        <span className="shrink-0 text-[11px] leading-none font-medium">{preset.name}</span>
        {/* Quiet at rest so nineteen sentences don't compete with nineteen status lines, and
            legible the moment you settle on one. */}
        <span className={cn('text-muted-foreground/40 group-hover/preset:text-muted-foreground/80 truncate text-[10px] leading-none', EASE)}>
          {preset.desc}
        </span>
        <span
          className={cn(
            'ml-auto shrink-0 font-mono text-[10px] leading-none transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
            active
              ? 'text-[#4ec9d6] opacity-100'
              : 'text-muted-foreground/70 opacity-0 group-hover/preset:opacity-100',
          )}
        >
          {active ? 'current' : 'apply'}
        </span>
      </span>
      <span className={cn(PREVIEW_TYPE, 'block overflow-hidden bg-black px-2 py-1.5')}>
        {preset.lines.map((line, i) => (
          <LinePreview key={i} line={line} settings={merged} thresholds={thresholds} />
        ))}
      </span>
    </button>
  )
}

// The preset gallery: finished status lines, grouped by what they are for. Clicking one
// replaces the layout, so the panel above this offers an undo.
//
// Arrow keys walk the list and apply as they go, so you can hold ↓ and watch the terminal
// above change through every preset rather than clicking one, looking up, and clicking back.
// Tab still steps through them without applying, which is what a keyboard user reaching for
// the rest of the page expects.
export function PresetList({ onApply }: { onApply: (preset: Preset) => void }) {
  const { lines, settings } = usePlaygroundContext()

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const cards = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[data-preset]')]
    const here = cards.indexOf(document.activeElement as HTMLButtonElement)
    if (here === -1) return
    // Stop at the ends rather than wrapping: a list you can hold an arrow down through should
    // come to rest, not cycle past the start again.
    const next = cards[here + (e.key === 'ArrowDown' ? 1 : -1)]
    if (!next) return
    e.preventDefault()
    next.focus()
    // The sticky group eyebrow overlaps the top of the list, so `nearest` alone can leave the
    // newly focused card tucked underneath it.
    next.scrollIntoView({ block: 'nearest' })
    const id = next.dataset.preset
    const preset = PRESET_GROUPS.flatMap((g) => g.presets).find((p) => p.id === id)
    if (preset) onApply(preset)
  }

  return (
    <div
      onKeyDown={onKeyDown}
      className="scrollbar-slim flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-3"
    >
      {PRESET_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1.5">
          {/* An eyebrow with a rule running off it, rather than another band of text: the groups
              have to be findable while scrolling without adding weight to a list that already
              has too much. */}
          <div className="bg-background sticky top-0 z-10 flex items-center gap-2 pt-3 pb-1.5">
            <span className="text-muted-foreground/50 text-[10px] font-medium tracking-[0.18em] uppercase">
              {group.label}
            </span>
            <span aria-hidden className="h-px flex-1 bg-white/[0.07]" />
          </div>
          {group.presets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              active={isCurrent(preset, lines, settings)}
              onApply={() => onApply(preset)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
