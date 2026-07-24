import type { ReactNode } from 'react'

// Shared shell for a documentation section: a constrained, readable column.
export function DocPage({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-2">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {lead ? <p className="text-base text-muted-foreground">{lead}</p> : null}
      </header>
      {children}
    </article>
  )
}

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">{title}</h2>
      {children}
    </section>
  )
}
