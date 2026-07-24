import { ExternalLink } from 'lucide-react'
import { DocPage, DocSection } from './doc-page'
import { OrdinaryNerdsBrand } from '@/components/layout/brand'

function Link({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80">
      {children}
      <ExternalLink className="size-3" />
    </a>
  )
}

export function About() {
  return (
    <DocPage title="About dashline" lead="A config-driven status line for Claude Code, built to be readable, fast, and yours to shape.">
      <DocSection title="What it is">
        <p className="text-sm text-muted-foreground">
          dashline turns a small JSON config into a status line that shows the session state you care about: git context, model and
          mode, usage and cost, and more. It ships as a Claude Code plugin and stays out of your way.
        </p>
      </DocSection>

      <DocSection title="Links">
        <ul className="flex flex-col gap-1.5 text-sm">
          <li>
            <Link href="https://github.com/ordinarynerds/dashline">GitHub repository</Link>
          </li>
          <li>
            <Link href="https://github.com/ordinarynerds/dashline/blob/main/RECIPES.md">Recipes</Link>
          </li>
          <li>
            <Link href="https://github.com/ordinarynerds/dashline/blob/main/README.md">Documentation</Link>
          </li>
        </ul>
      </DocSection>

      <DocSection title="License">
        <p className="text-sm text-muted-foreground">Released under the MIT license.</p>
      </DocSection>

      <div className="rounded-lg border bg-card p-4">
        <OrdinaryNerdsBrand />
      </div>
    </DocPage>
  )
}
