import { Plus, RotateCcw } from 'lucide-react'
import { Droppable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LineEditor } from './line-editor'
import { usePlaygroundContext } from './context'
import { LINE_TYPE, LINES_DROPPABLE } from './dnd'

// The stack of status-line rows, with controls to add a row or reset to defaults. Scrolls
// inside its own card so the preview above stays put.
export function LinesEditor() {
  const { lines, addLine, reset } = usePlaygroundContext()
  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-row items-center gap-2 border-b px-4 py-3.5">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm">Layout</CardTitle>
          <p className="text-xs text-muted-foreground">Drop widgets into the left, center, and right zones</p>
        </div>
        <span className="flex-1" />
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground transition-transform active:scale-[0.97]" onClick={reset}>
          <RotateCcw className="size-3.5" /> Reset
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 transition-transform active:scale-[0.97]" onClick={addLine}>
          <Plus className="size-3.5" /> Add line
        </Button>
      </CardHeader>
      <ScrollArea className="min-h-0 flex-1">
        <Droppable droppableId={LINES_DROPPABLE} type={LINE_TYPE}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-3 p-4">
              {lines.map((line, i) => (
                <LineEditor key={i} line={line} index={i} removable={lines.length > 1} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </ScrollArea>
    </Card>
  )
}
