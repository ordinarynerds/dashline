import type { ZoneKey } from '@/lib/dashline'

// Stable ids that connect the palette and every line zone to a single DragDropContext.
// Droppable ids are decoded in onDragEnd to route a drop to the right line + zone.

export const PALETTE_DROPPABLE = 'palette'

// Lines reorder in their own droppable. A distinct type keeps line drags and widget drags from
// ever targeting each other's droppables within the shared context.
export const LINES_DROPPABLE = 'lines'
export const LINE_TYPE = 'line'
export const lineDraggableId = (li: number): string => `line:${li}`

// A zone is addressed by its line index and zone key, e.g. "zone:0:left".
export const zoneDroppableId = (li: number, z: ZoneKey): string => `zone:${li}:${z}`

export function parseZoneDroppableId(id: string): { li: number; z: ZoneKey } | null {
  const [kind, li, z] = id.split(':')
  if (kind !== 'zone') return null
  return { li: Number(li), z: z as ZoneKey }
}

// Draggable ids only need to be unique within a render; index is the source of truth for moves.
export const paletteDraggableId = (widget: string): string => `palette:${widget}`
export const placedDraggableId = (li: number, z: ZoneKey, ii: number): string => `item:${li}:${z}:${ii}`
