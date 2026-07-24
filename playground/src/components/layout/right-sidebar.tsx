import { Sidebar } from '@/components/ui/sidebar'
import { RightPanel } from './right-panel'

// Desktop right sidebar holding the Widgets library and Config, behind a tab switcher. Mobile
// uses the sheet in the header instead.
export function RightSidebar() {
  return (
    <Sidebar side="right" collapsible="none" className="hidden w-80 border-l lg:flex">
      <RightPanel />
    </Sidebar>
  )
}
