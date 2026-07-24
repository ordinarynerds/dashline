import { PanelRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { RightPanel } from './right-panel'

// Widgets and config on small screens, where the right sidebar is hidden.
export function MobileConfig() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="size-8 lg:hidden" aria-label="Open widgets and config">
          <PanelRight className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 gap-0 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Widgets and configuration</SheetTitle>
          <SheetDescription>Drag widgets and adjust settings</SheetDescription>
        </SheetHeader>
        <RightPanel />
      </SheetContent>
    </Sheet>
  )
}
