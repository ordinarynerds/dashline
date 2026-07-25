import { PreviewPanel } from './preview-panel'
import { LibraryPanel } from './library-panel'

// The build view. The terminal is both the preview and the editor and sits on top, with the
// library — widgets to drag, presets to start from — directly beneath it, so a drag is a short
// trip from the palette to the line. On small screens it falls back to a natural,
// page-scrolling stack.
//
// The terminal is pinned rather than given the slack. Its content is a fixed stack — a few
// lines of scrollback, the composer, the status line — and it bottom-aligns, so every extra
// pixel became void above the scrollback rather than anything you could read. The library is
// the opposite: 32 widgets and 19 presets that never all fit. So the terminal takes what it
// needs and the library takes the rest, including everything a taller window offers.
export function Workspace() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:h-full lg:min-h-0">
      <div className="lg:h-[360px] lg:shrink-0">
        <PreviewPanel />
      </div>
      <div className="h-[240px] shrink-0 lg:h-auto lg:min-h-[220px] lg:flex-1">
        <LibraryPanel />
      </div>
    </div>
  )
}
