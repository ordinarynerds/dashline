import { OrdinaryNerdsMark } from '@/components/layout/nerd-mark'
import { cn } from '@/lib/utils'
import type { Release } from './changelog-data'

// The welcome box, in dashline's colours.
//
// Modelled on Claude Code's launch header (brainless.swerdlow.dev/components#claude-header), which
// puts its title *inside* the border. That is a real <fieldset>/<legend> rather than a drawn box,
// so the notch is cut by the browser, the title stays selectable, and the gap tracks the text at
// any zoom.
//
// Two changes from the original: the sprite is the Ordinary Nerds mark, and the corners are square
// like every other terminal surface in this app. Claude's box is round because the terminal draws
// it with ╭╮╰╯; this one is ours.
export function ReleaseBanner({ release, total, className }: { release: Release; total: number; className?: string }) {
  // The headline changes of the newest release. Three is what fits opposite the mark without the
  // box growing taller than the thing it introduces.
  const highlights = release.groups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title }))).slice(0, 3)

  return (
    <fieldset
      className={cn('min-w-0 border border-primary/70 px-3 pt-1 pb-3.5 font-mono text-[13px] leading-[1.5] sm:px-4', className)}
    >
      <legend className="max-w-full truncate px-2 text-primary">
        dashline <span className="text-muted-foreground">v{release.version}</span>
      </legend>

      <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_1px_minmax(0,1.15fr)]">
        <div className="flex min-w-0 flex-col items-center gap-2 py-1 text-center">
          <div className="font-semibold">Latest release</div>
          <OrdinaryNerdsMark className="my-1.5 size-14 text-primary" />
          <div className="min-w-0 space-y-0.5 break-words text-muted-foreground">
            <div>{release.date}</div>
            <div>
              {total} {total === 1 ? 'release' : 'releases'} so far
            </div>
            <div>MIT · Node 18+</div>
          </div>
        </div>

        <div aria-hidden className="hidden bg-primary/30 sm:block" />

        <div className="min-w-0 space-y-1">
          <div className="font-semibold text-primary">What&apos;s new</div>
          {highlights.map((h) => (
            <div key={h.text} className="min-w-0 break-words">
              {h.scope && <span className="text-muted-foreground">{h.scope} </span>}
              {h.text}
            </div>
          ))}
          <div className="my-1.5 h-px bg-primary/60" />
          <div className="font-semibold text-primary">Updating</div>
          <div className="min-w-0 break-words">/plugin marketplace update</div>
          <div className="text-muted-foreground italic">full history below</div>
        </div>
      </div>
    </fieldset>
  )
}
