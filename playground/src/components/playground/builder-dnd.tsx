import { type ReactNode } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { PALETTE_ORDER } from '@/lib/dashline'
import { flushSync } from 'react-dom'
import { useEditorUi } from '@/hooks/use-editor-ui'
import { usePreviewStore } from '@/hooks/use-preview-store'
import { usePlaygroundContext } from './context'
import { LINE_TYPE, PALETTE_DROPPABLE, parseZoneDroppableId } from './dnd'

// Wraps the whole build shell so the palette (right sidebar), the line stack, and every line zone
// (main column) share one drag context. Dropping is routed here: line drags reorder the stack,
// palette drags insert a fresh widget, and zone drags move the item across zones and lines.
export function BuilderDnd({ children }: { children: ReactNode }) {
  const { insertWidget, moveItem, moveLine } = usePlaygroundContext()
  const setDragging = useEditorUi((s) => s.setDragging)
  const pause = usePreviewStore((s) => s.pause)

  // Fires before the library measures its drop targets. An empty zone is zero-width at
  // rest, so it has to widen *now* — flushed synchronously, or the measurement captures
  // the collapsed box and drops fall through to a neighbouring zone.
  function onBeforeCapture() {
    flushSync(() => setDragging(true))
  }

  function onDragStart() {
    // Scenario playback resizes the very items being aimed at, so a drop target would
    // slide out from under the cursor. Editing wins; playback resumes on demand.
    pause()
  }

  function onDragEnd({ source, destination, type }: DropResult) {
    setDragging(false)
    if (!destination) return

    if (type === LINE_TYPE) {
      if (source.index === destination.index) return
      moveLine(source.index, destination.index)
      return
    }

    const to = parseZoneDroppableId(destination.droppableId)
    if (!to) return

    if (source.droppableId === PALETTE_DROPPABLE) {
      const widget = PALETTE_ORDER[source.index]
      if (widget) insertWidget(widget, { ...to, index: destination.index })
      return
    }

    const from = parseZoneDroppableId(source.droppableId)
    if (!from) return
    if (from.li === to.li && from.z === to.z && source.index === destination.index) return
    moveItem({ ...from, index: source.index }, { ...to, index: destination.index })
  }

  return (
    <DragDropContext onBeforeCapture={onBeforeCapture} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      {children}
    </DragDropContext>
  )
}
