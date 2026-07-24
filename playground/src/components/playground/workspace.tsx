import { PreviewPanel } from './preview-panel'
import { LinesEditor } from './lines-editor'

// The build view. On large screens it fills the viewport height so the live preview stays
// pinned while the layout editor scrolls on its own. Widgets and config live in the right
// panel. On small screens it falls back to a natural, page-scrolling stack.
export function Workspace() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:h-full lg:min-h-0">
      <div className="shrink-0">
        <PreviewPanel />
      </div>
      <div className="min-h-0 lg:flex-1">
        <LinesEditor />
      </div>
    </div>
  )
}
