import { Blocks, SlidersHorizontal } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WidgetList } from '@/components/playground/widget-list'
import { ConfigPanel } from '@/components/config/config-panel'

// A tab body that scrolls vertically with the scrollbar hidden, so switching tabs never shifts
// the panel width.
const bodyClass = 'mt-0 min-h-0 flex-1 overflow-y-auto scrollbar-hide'

// The right-hand workspace panel: a Widgets library and Config settings behind a top tab
// switcher. Shared by the desktop sidebar and the mobile sheet.
export function RightPanel() {
  return (
    <Tabs defaultValue="widgets" className="flex h-full min-h-0 flex-col gap-0">
      <div className="border-b p-2">
        <TabsList className="w-full">
          <TabsTrigger value="widgets" className="flex-1 gap-1.5">
            <Blocks className="size-3.5" /> Widgets
          </TabsTrigger>
          <TabsTrigger value="config" className="flex-1 gap-1.5">
            <SlidersHorizontal className="size-3.5" /> Config
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="widgets" className={bodyClass}>
        <WidgetList />
      </TabsContent>
      <TabsContent value="config" className={bodyClass}>
        <div className="p-4">
          <ConfigPanel />
        </div>
      </TabsContent>
    </Tabs>
  )
}
