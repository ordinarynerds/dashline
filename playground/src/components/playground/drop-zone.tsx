import { Droppable } from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'
import { ZONE_LABELS, type Item, type ZoneKey } from '@/lib/dashline'
import { PlacedItem } from './placed-item'
import { zoneDroppableId } from './dnd'

// A drop target for one zone of one line. Items stack vertically and can be reordered, moved to
// another zone, or moved to another line. New widgets arrive as clones from the palette.
export function DropZone({ li, z, items }: { li: number; z: ZoneKey; items: Item[] }) {
  return (
    <Droppable droppableId={zoneDroppableId(li, z)}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={cn(
            'flex min-h-[76px] flex-col gap-2 rounded-xl border border-dashed p-2.5 transition-colors duration-150 ease-[var(--ease-out)]',
            snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-border',
          )}
        >
          <span className="px-0.5 text-[11px] font-medium tracking-[0.12em] text-muted-foreground/70 uppercase">{ZONE_LABELS[z]}</span>
          {items.map((item, ii) => (
            <PlacedItem key={ii} li={li} z={z} ii={ii} item={item} />
          ))}
          {items.length === 0 && !snapshot.isDraggingOver && (
            <span className="grid flex-1 place-items-center text-xs text-muted-foreground/40">drop here</span>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}
