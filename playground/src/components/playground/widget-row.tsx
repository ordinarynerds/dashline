import { GripVertical } from 'lucide-react'
import { Draggable } from '@hello-pangea/dnd'
import { WIDGETS, isCustom } from '@/lib/dashline'
import { cn } from '@/lib/utils'
import { PREVIEW_TYPE, WidgetTokens } from './widget-tokens'
import { paletteDraggableId } from './dnd'
import { usePlaygroundContext } from './context'

// A palette entry: the widget drawn exactly as it will appear in a line, with its config
// name kept deliberately quiet beside it. The preview is the thing you choose by, so it
// carries the weight; the id is there for when you need to type it.
//
// This is not the same component as a placed chip, and should not be: a palette row is a
// catalogue entry that drags to copy and needs an identifier, while a chip is the artifact
// itself, dragging to move and clicking to open its options. What they share is the
// preview and its typography, which is exactly what PREVIEW_TYPE and WidgetTokens are.
export function WidgetCard({ id, dragging }: { id: string; dragging?: boolean }) {
  const { settings } = usePlaygroundContext()
  const w = WIDGETS[id]
  if (!w) return null

  return (
    <div
      title={`${id} — ${w.name}. ${w.desc}\n\nClick to add it to the first line, or drag it where you want it.`}
      className={cn(
        // Square, like the selection pills in the terminal: a palette row is a preview of
        // terminal content, so it should not round what the terminal never rounds.
        'group flex items-center gap-2 border px-2 py-1',
        dragging
          ? 'border-primary/40 bg-popover shadow-lg shadow-black/20'
          : 'hover:border-border hover:bg-accent/60 cursor-grab border-transparent active:cursor-grabbing',
      )}
    >
      <GripVertical className="text-muted-foreground/25 group-hover:text-muted-foreground/70 size-3.5 shrink-0 transition-colors" />
      <span className={cn(PREVIEW_TYPE, 'min-w-0 flex-1 overflow-hidden text-ellipsis')}>
        <WidgetTokens id={id} theme={settings.theme} icons={settings.icons} />
      </span>
      {/* The reserved ids of the custom items are internal; showing them would suggest
          you type "$text" somewhere, when the config takes a { text } object.
          Fixed width and right-aligned: previews are variable-width, so an id that hugged each
          one left two ragged edges down the column and neither could be scanned. Pinned, the
          ids form a second clean column and the previews get a consistent truncation point. */}
      {/* 8ch is the longest id in the set — worktree, thinking, duration — so nothing truncates
          and the column is no wider than it has to be. */}
      <span className="text-muted-foreground/40 group-hover:text-muted-foreground/70 w-[8ch] shrink-0 truncate text-right font-mono text-[10px] transition-colors">
        {isCustom(id) ? w.name : id}
      </span>
    </div>
  )
}

// A palette entry made draggable. Because the enclosing Droppable renders a clone, the original
// stays in place and dragging copies a fresh widget into a zone rather than moving it out.
// A filtered-out row is hidden rather than unmounted: its drag index has to stay consecutive
// with the rest of the palette.
export function WidgetRow({ id, index, hidden }: { id: string; index: number; hidden?: boolean }) {
  const { insertWidget, lines } = usePlaygroundContext()
  if (!WIDGETS[id]) return null

  // Dragging was the only way to place a widget, which left the palette unusable by keyboard —
  // and made even a mouse user drag across the panel for something they could have clicked.
  // Activating a row appends to the end of the first line's left zone, the one place that
  // exists in every layout. rbd only treats a press as a drag once the pointer moves, so this
  // and the drag share the handle without conflict.
  const append = () => insertWidget(id, { li: 0, z: 'left', index: lines[0]?.left.length ?? 0 })

  return (
    <Draggable draggableId={paletteDraggableId(id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={append}
          onKeyDown={(e) => {
            // Enter is ours; Space belongs to the drag library, which lifts the item with it.
            if (e.key !== 'Enter') return
            e.preventDefault()
            append()
          }}
          className={cn(hidden && 'hidden')}
        >
          <WidgetCard id={id} dragging={snapshot.isDragging} />
        </div>
      )}
    </Draggable>
  )
}
