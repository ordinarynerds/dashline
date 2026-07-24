import { GripVertical } from 'lucide-react'
import { Draggable } from '@hello-pangea/dnd'
import { WIDGETS } from '@/lib/dashline'
import { cn } from '@/lib/utils'
import { WidgetTokens } from './widget-tokens'
import { paletteDraggableId } from './dnd'
import { usePlaygroundContext } from './context'

// The visual of a palette entry: name, one-line purpose, and a live colored preview of what it
// renders. Shared by the in-list row and the clone that flies under the cursor while dragging.
export function WidgetCard({ id, dragging }: { id: string; dragging?: boolean }) {
  const { settings } = usePlaygroundContext()
  const w = WIDGETS[id]
  if (!w) return null

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg border px-2.5 py-2',
        dragging
          ? 'border-primary/40 bg-popover shadow-lg shadow-black/20'
          : 'cursor-grab border-transparent hover:border-border hover:bg-accent/60 active:cursor-grabbing',
      )}
    >
      <GripVertical className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-medium">{id}</span>
          <span className="truncate text-xs text-muted-foreground">{w.name}</span>
        </div>
        <div className="mt-0.5 truncate font-mono text-xs">
          <WidgetTokens id={id} theme={settings.theme} icons={settings.icons} />
        </div>
      </div>
    </div>
  )
}

// A palette entry made draggable. Because the enclosing Droppable renders a clone, the original
// stays in place and dragging copies a fresh widget into a zone rather than moving it out.
export function WidgetRow({ id, index }: { id: string; index: number }) {
  if (!WIDGETS[id]) return null
  return (
    <Draggable draggableId={paletteDraggableId(id)} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <WidgetCard id={id} dragging={snapshot.isDragging} />
        </div>
      )}
    </Draggable>
  )
}
