import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { SCENARIOS } from '@/lib/dashline'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { usePreviewAutoplay, usePreviewStore } from '@/hooks/use-preview-store'

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
    </div>
  )
}
