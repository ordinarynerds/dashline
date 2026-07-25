import { Pause, Play, Plus, RotateCcw, SkipBack, SkipForward, SquareDashed, SquareDashedBottom } from 'lucide-react'
import { SCENARIOS } from '@/lib/dashline'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePreviewAutoplay, usePreviewStore } from '@/hooks/use-preview-store'
import { WIDTHS, useEditorUi } from '@/hooks/use-editor-ui'
import { usePlaygroundContext } from './context'

// Transport controls for the terminal preview: step through the sample states, play them on a
// loop, or jump to one by its dot. Drives the shared preview store the terminal reads from.
export function PreviewControls() {
  usePreviewAutoplay()
  const index = usePreviewStore((s) => s.index)
  const playing = usePreviewStore((s) => s.playing)
  const prev = usePreviewStore((s) => s.prev)
  const next = usePreviewStore((s) => s.next)
  const toggle = usePreviewStore((s) => s.toggle)
  const setIndex = usePreviewStore((s) => s.setIndex)
  const { addLine, reset } = usePlaygroundContext()
  const showZones = useEditorUi((s) => s.showZones)
  const columns = useEditorUi((s) => s.columns)
  const setColumns = useEditorUi((s) => s.setColumns)
  const toggleZones = useEditorUi((s) => s.toggleZones)
  const scenario = SCENARIOS[index]

  return (
    <div className="flex items-center gap-1 border-b bg-muted/20 px-2 py-1.5">
      <Button variant="ghost" size="icon-xs" onClick={prev} aria-label="previous state">
        <SkipBack />
      </Button>
      <Button variant="ghost" size="icon-xs" onClick={toggle} aria-label={playing ? 'pause playback' : 'play states'}>
        {playing ? <Pause /> : <Play />}
      </Button>
      <Button variant="ghost" size="icon-xs" onClick={next} aria-label="next state">
        <SkipForward />
      </Button>
      <span className="ml-1 min-w-0 flex-1 truncate text-xs font-medium">{scenario.name}</span>
      <div className="flex items-center gap-1.5 pr-1">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setIndex(i)}
            aria-label={`show ${s.name}`}
            title={s.name}
            className={cn(
              'size-1.5 rounded-full transition-all',
              i === index ? 'scale-125 bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60',
            )}
          />
        ))}
      </div>

      {/* The status line below is the editor, so its controls belong on its own toolbar. */}
      <Separator orientation="vertical" className="mx-1 !h-4" />

      {/* A terminal has an edge and dashline lays out against it, so a line that reads well in
          a wide browser can be clipped at 80. These pin the preview to a real width.
          Borderless: this strip sits directly above the thing it is meant to serve, and an
          enclosed control here read louder than the status line below it. */}
      <div className="flex items-center gap-px">
        {[...WIDTHS, null].map((w) => (
          <button
            key={w ?? 'full'}
            onClick={() => setColumns(w)}
            aria-pressed={columns === w}
            title={w ? `Preview at ${w} columns` : 'Preview at the full width of the panel'}
            className={cn(
              'rounded-sm px-1.5 py-0.5 text-[11px] tabular-nums transition-colors',
              w && 'font-mono',
              columns === w ? 'bg-accent text-foreground' : 'text-muted-foreground/70 hover:text-foreground',
            )}
          >
            {w ?? 'Full'}
          </button>
        ))}
      </div>

      <Separator orientation="vertical" className="mx-1 !h-4" />
      <Button
        variant="ghost"
        size="sm"
        aria-pressed={showZones}
        title={showZones ? 'Hide the zone outlines' : 'Show the left, center, and right zones'}
        className={cn('h-7 gap-1.5 px-2', showZones ? 'bg-accent text-foreground' : 'text-muted-foreground')}
        onClick={toggleZones}
      >
        {showZones ? <SquareDashedBottom className="size-3.5" /> : <SquareDashed className="size-3.5" />} Zones
      </Button>
      <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-muted-foreground" onClick={addLine}>
        <Plus className="size-3.5" /> Line
      </Button>
      <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-muted-foreground" onClick={reset} title="Reset the layout to the default">
        <RotateCcw className="size-3.5" /> Reset
      </Button>
    </div>
  )
}
