import { useMemo } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import { Bot, Clock, Gauge, GitBranch, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CATEGORIES, PALETTE_ORDER, WIDGETS, widgetsByCategory, type CategoryKey } from '@/lib/dashline'
import { cn } from '@/lib/utils'
import { WidgetCard, WidgetRow } from './widget-row'
import { PALETTE_DROPPABLE } from './dnd'

const CATEGORY_ICONS: Record<CategoryKey, LucideIcon> = {
  git: GitBranch,
  model: Bot,
  usage: Gauge,
  session: Clock,
  custom: Wrench,
}

const COLUMNS = 4

// Categories do not hold equal numbers of widgets — Git & repo has twelve, Custom has two — so
// giving each its own column made the tallest 4.4× the shortest and left roughly 320px empty
// under Custom while Git & repo had to scroll. Pack them instead: longest first, each into
// whichever column is currently shortest.
//
// Categories stay whole. Splitting one across columns would break the only grouping the palette
// has, and the rows inside keep their PALETTE_ORDER indices either way, so the drag library
// never sees this.
function packColumns(cats: { key: CategoryKey; label: string }[]): { key: CategoryKey; label: string; ids: string[] }[][] {
  const cols: { key: CategoryKey; label: string; ids: string[] }[][] = Array.from({ length: COLUMNS }, () => [])
  const heights = new Array(COLUMNS).fill(0)

  const byLength = cats
    .map((c) => ({ ...c, ids: widgetsByCategory(c.key) }))
    .sort((a, b) => b.ids.length - a.ids.length)

  for (const cat of byLength) {
    const into = heights.indexOf(Math.min(...heights))
    cols[into]!.push(cat)
    // One row each, plus the header the category costs its column.
    heights[into] += cat.ids.length + 1
  }
  return cols
}

const PACKED = packColumns(CATEGORIES)

// The widget library, one column per category beneath the terminal, and the drag source for
// the editor. Drops onto it are disabled and a clone flies under the cursor, so dragging a
// row copies the widget into a zone while the palette stays intact.
//
// A row filtered out by the search is hidden, never unmounted: drag indices come from
// PALETTE_ORDER and have to stay consecutive for the drag library. The search box itself
// lives in the panel's tab strip, which is why the query arrives as a prop.
export function WidgetList({ query }: { query: string }) {
  const q = query.trim().toLowerCase()
  const matches = useMemo(() => {
    if (!q) return null // null means "everything matches"
    return new Set(
      PALETTE_ORDER.filter((id) => {
        const w = WIDGETS[id]
        if (!w) return false
        return id.toLowerCase().includes(q) || w.name.toLowerCase().includes(q) || w.desc.toLowerCase().includes(q)
      }),
    )
  }, [q])

  return (
    <Droppable
      droppableId={PALETTE_DROPPABLE}
      isDropDisabled
      renderClone={(provided, _snapshot, rubric) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <WidgetCard id={PALETTE_ORDER[rubric.source.index]} dragging />
        </div>
      )}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          // No top padding: the sticky headers supply their own, so they cover the top
          // edge cleanly instead of letting rows scroll through a gap above them.
          className="scrollbar-slim grid min-h-0 flex-1 grid-cols-2 items-start gap-x-3 overflow-y-auto px-2 pb-2 sm:grid-cols-3 lg:grid-cols-4"
        >
          {PACKED.map((column, ci) => (
            <div key={ci} className="flex min-w-0 flex-col">
              {column.map((cat) => {
                const shown = matches ? cat.ids.filter((id) => matches.has(id)) : cat.ids
                const Icon = CATEGORY_ICONS[cat.key]
                return (
                  <div key={cat.key} className={cn('flex min-w-0 flex-col gap-0.5', shown.length === 0 && 'hidden')}>
                    <div className="text-muted-foreground bg-background sticky top-0 z-10 flex items-center gap-1.5 px-2 pt-2 pb-1.5">
                      <Icon className="size-3.5 shrink-0" />
                      <span className="truncate text-[11px] font-medium tracking-[0.1em] uppercase">{cat.label}</span>
                      <span className="text-muted-foreground/50 text-[11px]">{shown.length}</span>
                    </div>
                    {cat.ids.map((id) => (
                      <WidgetRow key={id} id={id} index={PALETTE_ORDER.indexOf(id)} hidden={!!matches && !matches.has(id)} />
                    ))}
                  </div>
                )
              })}
            </div>
          ))}

          {matches?.size === 0 && (
            <p className="text-muted-foreground/60 col-span-full px-2 py-6 text-center text-xs">
              No widget matches “{query.trim()}”.
            </p>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}
