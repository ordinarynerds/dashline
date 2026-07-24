import { Droppable } from '@hello-pangea/dnd'
import { CATEGORIES, PALETTE_ORDER, widgetsByCategory } from '@/lib/dashline'
import { WidgetCard, WidgetRow } from './widget-row'
import { PALETTE_DROPPABLE } from './dnd'

// The widget library as a clean, grouped list, and the drag source for the builder. Drops onto
// it are disabled and a clone flies under the cursor, so dragging a row copies the widget into a
// zone while the palette stays intact.
export function WidgetList() {
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
        <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-4 p-3">
          <p className="px-2.5 text-xs text-muted-foreground">Drag a widget into a zone.</p>
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="flex flex-col gap-0.5">
              <div className="px-2.5 pb-1 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{cat.label}</div>
              {widgetsByCategory(cat.key).map((id) => (
                <WidgetRow key={id} id={id} index={PALETTE_ORDER.indexOf(id)} />
              ))}
            </div>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  )
}
