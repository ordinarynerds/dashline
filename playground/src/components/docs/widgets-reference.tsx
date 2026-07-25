import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { CATEGORIES, TEXT_VARIANTS, WIDGETS, isCustom, variantsFor, widgetsByCategory } from '@/lib/dashline'
import { Input } from '@/components/ui/input'
import { WidgetTokens } from '@/components/playground/widget-tokens'
import { DocPage } from './doc-page'

// One widget, as a reference entry.
//
// The name field is gone from the card. It sat opposite the id and said "git branch" above a
// description reading "Current git branch" — thirty-two cards, thirty-two near-duplications. It
// still feeds the search index, where a second phrasing helps.
//
// Variants are the reason to open a reference page and they were the one thing missing: the id
// tells you what to type, the variants tell you what else you can type.
const SHARED_TEXT = new Set<string>(TEXT_VARIANTS)

function ReferenceCard({ id }: { id: string }) {
  const w = WIDGETS[id]
  const variants = variantsFor(id)
  if (!w) return null

  return (
    <div className="flex flex-col gap-2.5 border bg-card p-3.5">
      <span className="font-mono text-sm font-medium">{isCustom(id) ? w.name : id}</span>
      {/* Square, like every other surface in the app that holds terminal output. */}
      <div className="scrollbar-hide overflow-x-auto border border-white/10 bg-black px-2.5 py-1.5 font-mono text-[13px]">
        <WidgetTokens id={id} />
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{w.desc}</p>
      {variants.length > 0 && (
        // Pushed to the bottom so the chip rows line up across a grid row instead of floating at
        // whatever height each description happens to end.
        <div className="mt-auto flex flex-wrap items-center gap-1 pt-1.5">
          <span className="mr-0.5 text-[10px] tracking-[0.12em] text-muted-foreground/50 uppercase">Variants</span>
          {variants.map((v) => (
            <code
              key={v}
              // basename / upper / lower are the presenter's text transforms and appear on almost
              // every card. At full weight they repeated twenty times over and buried the variants
              // that are actually specific to a widget — `owner` on repo, `staged` on dirty. Quiet
              // them; the note under the search box explains them once.
              className={
                SHARED_TEXT.has(v)
                  ? 'rounded-sm bg-foreground/[0.03] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground/60'
                  : 'rounded-sm bg-foreground/[0.07] px-1.5 py-0.5 font-mono text-[11px] text-foreground/80'
              }
            >
              {v}
            </code>
          ))}
        </div>
      )}
    </div>
  )
}

export function WidgetsReference() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  // The palette on the Build tab has a search box; the page you actually visit to look a widget up
  // did not, so finding one of thirty-two meant scrolling and reading.
  const groups = useMemo(() => {
    const hit = (id: string) => {
      if (!q) return true
      const w = WIDGETS[id]
      if (!w) return false
      return (
        id.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        w.desc.toLowerCase().includes(q) ||
        variantsFor(id).some((v) => v.toLowerCase().includes(q))
      )
    }
    return CATEGORIES.map((cat) => ({ ...cat, ids: widgetsByCategory(cat.key).filter(hit) })).filter((g) => g.ids.length > 0)
  }, [q])

  const total = groups.reduce((n, g) => n + g.ids.length, 0)

  return (
    <DocPage
      title="Widget reference"
      lead="Every widget dashline can draw, with a live preview and the variants it accepts. Widgets are placed on the Build tab."
      width="wide"
      next={{ to: '/build', title: 'Build your status line', hint: 'Drag any of these into a zone' }}
    >
      <div className="flex flex-col gap-2.5">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search widgets, descriptions, variants"
            aria-label="Search widgets"
            className="h-9 pl-8"
          />
        </div>
        <p className="doc-prose text-xs text-muted-foreground">
          A variant goes second in the item: <code>["cwd", "basename"]</code>. The dimmed ones —{' '}
          <code>basename</code>, <code>upper</code>, <code>lower</code> — are text transforms every text widget accepts.
        </p>
      </div>

      {total === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No widget matches “{query.trim()}”.</p>
      ) : (
        <div className="flex flex-col gap-9">
          {groups.map((cat) => (
            <section key={cat.key} className="flex flex-col gap-3">
              <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {cat.label}
                <span className="text-muted-foreground/50">{cat.ids.length}</span>
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {cat.ids.map((id) => (
                  <ReferenceCard key={id} id={id} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </DocPage>
  )
}
