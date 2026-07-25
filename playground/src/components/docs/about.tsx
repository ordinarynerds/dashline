import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { DocPage, DocSection } from './doc-page'

// External links, quiet. They were coral — the same colour that marks the one primary action on
// the Build screen — which spent the loudest ink in the palette on three ordinary hyperlinks.
// Underline carries "link" perfectly well; coral has a job.
function Ext({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-0.5 text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors duration-150 ease-[var(--ease-out)] hover:decoration-foreground/70"
    >
      {children}
      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
    </a>
  )
}

// A fact and its value, for the things people actually check before installing something that runs
// on every prompt.
const FACTS: { label: string; value: string; to?: string }[] = [
  { label: 'Version', value: __DASHLINE_VERSION__, to: '/changelog' },
  { label: 'Runtime deps', value: 'None' },
  { label: 'Requires', value: 'Node 18+' },
  { label: 'License', value: 'MIT' },
]

export function About() {
  return (
    <DocPage
      title="About dashline"
      lead="A config-driven status line for Claude Code, built to be readable, fast, and yours to shape."
    >
      <dl className="grid grid-cols-2 gap-px overflow-hidden border bg-border sm:grid-cols-4">
        {FACTS.map((f) => (
          <div key={f.label} className="flex flex-col gap-1 bg-card px-3.5 py-3">
            <dt className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{f.label}</dt>
            <dd className="font-mono text-sm">
              {f.to ? (
                <Link
                  to={f.to}
                  className="underline decoration-foreground/25 underline-offset-4 transition-colors duration-150 ease-[var(--ease-out)] hover:decoration-foreground/70"
                >
                  {f.value}
                </Link>
              ) : (
                f.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      <DocSection title="What it is">
        <p>
          dashline turns a small JSON config into a status line that shows the session state you care about: git context, model and
          mode, usage and cost, and more. It ships as a Claude Code plugin and stays out of your way.
        </p>
      </DocSection>

      <DocSection title="How it is built">
        <p>
          A status line runs on every prompt, so the cost of drawing it is the whole design. dashline has{' '}
          <strong>no runtime dependencies</strong> and builds to a single ~42 KB file. Nothing is fetched, nothing is cached to disk,
          and no daemon runs in the background.
        </p>
        <p>
          Subprocesses are <strong>gated on what you placed</strong>. Every widget declares what it needs, and dashline runs the
          union — a line with four git widgets reads git once, and a line with none never shells out at all. The builder shows the
          count for the line you are editing.
        </p>
        <p>
          The playground on this site renders with the same logic the CLI does, so what the preview draws is what your terminal
          prints — down to the column.
        </p>
      </DocSection>

      <DocSection title="Links">
        <ul>
          <li>
            <Ext href="https://github.com/ordinarynerds/dashline">Source on GitHub</Ext>
          </li>
          <li>
            <Ext href="https://github.com/ordinarynerds/dashline/blob/main/RECIPES.md">Recipes</Ext> — worked configurations to copy
          </li>
          <li>
            <Ext href="https://github.com/ordinarynerds/dashline/blob/main/README.md">README</Ext> — the full option reference
          </li>
          <li>
            <Ext href="https://github.com/ordinarynerds/dashline/issues">Issues</Ext> — bugs and widget requests
          </li>
        </ul>
      </DocSection>

      {/* The studio signature lives in the sidebar footer, on every page. Repeating the lockup here
          in a card of its own said it twice and made the page end on a placeholder. */}
      <p className="doc-prose border-t pt-6 text-sm text-muted-foreground">
        Released under the MIT license. Built by <Ext href="https://github.com/ordinarynerds">Ordinary Nerds</Ext>
      </p>
    </DocPage>
  )
}
