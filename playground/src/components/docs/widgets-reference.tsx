import { CATEGORIES, WIDGETS, widgetsByCategory } from '@/lib/dashline'
import { WidgetTokens } from '@/components/playground/widget-tokens'
import { DocPage } from './doc-page'

function WidgetCard({ id }: { id: string }) {
  const w = WIDGETS[id]
  if (!w) return null
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-sm font-medium">{id}</span>
        <span className="truncate text-xs text-muted-foreground">{w.name}</span>
      </div>
      <div className="overflow-x-auto rounded-md bg-black px-2.5 py-1.5 font-mono text-[13px]">
        <WidgetTokens id={id} />
      </div>
      <p className="text-xs text-muted-foreground">{w.desc}</p>
    </div>
  )
}

export function WidgetsReference() {
  return (
    <DocPage title="Widget reference" lead="Every widget, with a live preview of what it draws. Drag any of these into a zone on the Build tab.">
      <div className="flex flex-col gap-8">
        {CATEGORIES.map((cat) => (
          <section key={cat.key} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold tracking-[0.1em] text-muted-foreground uppercase">{cat.label}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {widgetsByCategory(cat.key).map((id) => (
                <WidgetCard key={id} id={id} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </DocPage>
  )
}
