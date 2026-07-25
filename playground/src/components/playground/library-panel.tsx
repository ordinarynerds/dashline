import { useRef, useState } from 'react'
import { Blocks, LayoutTemplate, Search, Undo2, X } from 'lucide-react'
import type { Line, Settings } from '@/lib/dashline'
import type { Preset } from '@/lib/presets'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WidgetList } from './widget-list'
import { PresetList } from './preset-list'
import { usePlaygroundContext } from './context'

// Everything you build a line out of, in one panel under the terminal: the widget library you
// drag from, and the presets you start from. They share a strip because they answer the same
// question at different sizes — one widget, or a whole line.
export function LibraryPanel() {
  const { settings, lines, setAll } = usePlaygroundContext()
  const [tab, setTab] = useState('widgets')
  const [query, setQuery] = useState('')
  // The layout a preset replaced. The builder writes state to the URL with replaceState, so the
  // browser's Back button cannot undo an apply — without this, one click silently discards
  // however long you spent arranging a line.
  const [undo, setUndo] = useState<{ settings: Settings; lines: Line[] } | null>(null)
  // The layout the last apply produced, so a later apply can tell an uninterrupted run of them
  // from one that follows an edit of your own.
  const applied = useRef<Line[] | null>(null)

  function applyPreset(preset: Preset) {
    // Walking the list with the arrow keys applies on every keystroke, so snapshotting each
    // time would leave undo pointing at the preset before last — useless after holding ↓
    // through ten of them. A run of applies is one action: keep the snapshot from before the
    // first. Touching the layout in between ends the run, since the state to return to is then
    // the edited one, not whatever preceded the browsing.
    const untouched = applied.current && JSON.stringify(applied.current) === JSON.stringify(lines)
    if (!untouched || !undo) setUndo({ settings, lines })
    applied.current = preset.lines
    // A preset owns the layout, and only the settings it explicitly names.
    setAll({ ...settings, ...preset.settings }, preset.lines)
  }

  function revert() {
    if (!undo) return
    setAll(undo.settings, undo.lines)
    setUndo(null)
    applied.current = null
  }

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-xl border"
    >
      <div className="bg-muted/30 flex shrink-0 items-center gap-2 border-b px-2 py-1.5">
        <TabsList variant="line" className="h-7">
          <TabsTrigger value="widgets" className="gap-1.5 px-2">
            <Blocks className="size-3.5" /> Widgets
          </TabsTrigger>
          <TabsTrigger value="presets" className="gap-1.5 px-2">
            <LayoutTemplate className="size-3.5" /> Presets
          </TabsTrigger>
        </TabsList>

        <span className="flex-1" />

        {tab === 'widgets' ? (
          <div className="relative w-56">
            <Search className="text-muted-foreground/60 pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search widgets…"
              aria-label="Search widgets"
              className="h-7 pr-7 pl-8 text-xs"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="text-muted-foreground/60 hover:text-foreground absolute top-1/2 right-2 grid size-4 -translate-y-1/2 place-items-center rounded transition-colors"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        ) : (
          undo && (
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={revert}>
              <Undo2 className="size-3.5" /> Undo apply
            </Button>
          )
        )}
      </div>

      <TabsContent value="widgets" className="flex min-h-0 flex-col">
        <WidgetList query={query} />
      </TabsContent>
      <TabsContent value="presets" className="flex min-h-0 flex-col">
        <PresetList onApply={applyPreset} />
      </TabsContent>
    </Tabs>
  )
}
