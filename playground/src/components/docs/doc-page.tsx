import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// How wide the reading column runs.
//
// `prose` is set from a measurement, not a unit. `ch` is the wrong tool here — it resolves against
// the inherited 16px sans, and Geist's zero is wider than its average lowercase, so `68ch` rendered
// at 101 characters per line. Counted properly (walking a Range over each paragraph and grouping
// the rects by line box), Geist averages ~0.44em per character, which puts the classic 30em ≈ 65
// characters rule right where the textbooks say it is.
//
// The 34rem that lands full lines around 80 characters is applied to the paragraphs themselves
// (`.doc-prose > p` in index.css), not here — code blocks need more room than sentences do, and
// clamping the column clipped the default settings.json mid-line. `prose` is therefore the width
// of the widest code block on these pages, and the text sits in a narrower measure inside it.
//
// `wide` is for pages whose content is a grid rather than sentences, where the measure argument
// does not apply. `list` sits between them, for content that spends part of its width on a rail.
const MEASURE = { prose: 'max-w-[48rem]', list: 'max-w-[52rem]', wide: 'max-w-[76rem]' } as const

export interface NextLink {
  to: string
  title: string
  hint?: string
  label?: string
}

// Shared shell for a documentation section.
//
// Left-aligned, not centred. The sidebar already establishes a left rail for the whole app, and
// centring a fixed column inside the main area put ~230px of dead space on *both* sides while
// leaving the page title floating out of line with every other thing on screen. One rail.
export function DocPage({
  title,
  lead,
  width = 'prose',
  children,
  next,
}: {
  title: string
  lead?: string
  width?: keyof typeof MEASURE
  children: ReactNode
  next?: NextLink
}) {
  return (
    <article className={cn('flex w-full flex-col gap-10 pb-16', MEASURE[width])}>
      <header className="flex flex-col gap-3">
        {/* The top of the docs type scale. The page owns its title; the header bar above shows a
            quiet breadcrumb instead of printing the same words a second time at a different size
            and a different left edge. */}
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">{title}</h1>
        {/* The lead is larger type, so it needs a narrower column than the body to land on a
            similar character count — same measure, fewer characters per line. */}
        {lead ? <p className="max-w-[30rem] text-[17px] leading-relaxed text-foreground/80">{lead}</p> : null}
      </header>
      {children}
      {next ? <DocNext {...next} /> : null}
    </article>
  )
}

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex scroll-mt-20 flex-col gap-3" id={slug(title)}>
      <h2 className="text-[19px] font-semibold tracking-[-0.01em]">{title}</h2>
      <div className="doc-prose flex flex-col gap-3">{children}</div>
    </section>
  )
}

// Every docs page used to end in whatever empty space was left below it. Getting started → Install
// → Build is a sequence, and the only way to advance it was to go back to the sidebar and guess.
function DocNext({ to, title, hint, label = 'Next' }: NextLink) {
  return (
    <Link
      to={to}
      className="group mt-2 flex items-center justify-between gap-4 border bg-card px-4 py-3.5 transition-colors duration-200 ease-[var(--ease-out)] hover:border-foreground/25 hover:bg-accent/40"
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">{label}</span>
        <span className="truncate text-sm font-medium">{title}</span>
        {hint ? <span className="truncate text-xs text-muted-foreground">{hint}</span> : null}
      </span>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-[transform,color] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  )
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
