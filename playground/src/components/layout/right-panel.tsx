import { SlidersHorizontal } from 'lucide-react'
import { ConfigPanel } from '@/components/config/config-panel'

// The right-hand workspace panel. The widget library used to share it behind a tab switcher;
// it now sits under the terminal, beside the line it drags onto, which leaves this panel to
// the settings alone. Shared by the desktop sidebar and the mobile sheet.
export function RightPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-1.5 border-b p-3 text-sm font-medium">
        <SlidersHorizontal className="size-3.5" /> Config
      </div>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4">
        <ConfigPanel />
      </div>
    </div>
  )
}
