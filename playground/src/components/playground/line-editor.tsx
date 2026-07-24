import { GripVertical, Trash2 } from 'lucide-react'
import { Draggable } from '@hello-pangea/dnd'
import type { Line } from '@/lib/dashline'
import { ZONES } from '@/lib/dashline'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { DropZone } from './drop-zone'
import { usePlaygroundContext } from './context'
import { lineDraggableId } from './dnd'

// One status-line row. Drag it by the grip in the header to reorder the stack; the zones inside
// stay their own drop targets, so widget drags and line drags never collide (distinct dnd types).
export function LineEditor({ line, index, removable }: { line: Line; index: number; removable: boolean }) {
  const { removeLine } = usePlaygroundContext()
  const itemCount = line.left.length + line.center.length + line.right.length

  const removeButton = (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 px-2 text-muted-foreground transition-transform hover:text-destructive active:scale-[0.97]"
      // An empty line removes immediately; one with widgets asks first (via the wrapping dialog).
      onClick={itemCount === 0 ? () => removeLine(index) : undefined}
    >
      <Trash2 className="size-3.5" /> Remove
    </Button>
  )

  return (
    <Draggable draggableId={lineDraggableId(index)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'flex flex-col gap-2.5 rounded-xl border bg-card/40 p-3',
            snapshot.isDragging ? 'border-primary/50 shadow-lg shadow-black/20' : 'border-border',
          )}
        >
          <div className="flex items-center gap-2">
            <span
              {...provided.dragHandleProps}
              aria-label={`drag line ${index + 1}`}
              className="grid size-6 shrink-0 cursor-grab place-items-center rounded-md text-muted-foreground/50 outline-none transition-colors hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
            >
              <GripVertical className="size-4" />
            </span>
            <span className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">Line {index + 1}</span>
            <span className="flex-1" />
            {removable &&
              (itemCount === 0 ? (
                removeButton
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>{removeButton}</AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove line {index + 1}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This line has {itemCount} widget{itemCount === 1 ? '' : 's'}. Removing it deletes{' '}
                        {itemCount === 1 ? 'it' : 'them'} too. This can't be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className={buttonVariants({ variant: 'destructive' })}
                        onClick={() => removeLine(index)}
                      >
                        Remove line
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ))}
          </div>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            {ZONES.map((z) => (
              <DropZone key={z} li={index} z={z} items={line[z]} />
            ))}
          </div>
        </div>
      )}
    </Draggable>
  )
}
