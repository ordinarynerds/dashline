import { create } from 'zustand'

// Chrome state for the terminal, which is both the preview and the editor.
//
// `dragging` is set before the drag library measures its drop targets, so an empty zone
// can widen into something aimable. `showZones` pins those outlines on for as long as you
// want them. Neither is on at rest: untouched, the terminal has to stay a faithful picture
// of the status line, which is the only reason to trust what it shows.
// `columns` narrows the preview to a fixed terminal width. Everything compose() does depends on
// it — the left zone is clipped to keep the right one whole, and a centred zone gives up being
// centred once the gap either side would fall below one column — and none of that is reachable
// while the preview is simply as wide as the browser. null means the full width of the panel.
export const WIDTHS = [80, 100, 120] as const

interface EditorUi {
  dragging: boolean
  setDragging: (dragging: boolean) => void
  showZones: boolean
  toggleZones: () => void
  columns: number | null
  setColumns: (columns: number | null) => void
}

export const useEditorUi = create<EditorUi>((set) => ({
  dragging: false,
  setDragging: (dragging) => set({ dragging }),
  showZones: false,
  toggleZones: () => set((s) => ({ showZones: !s.showZones })),
  columns: null,
  setColumns: (columns) => set({ columns }),
}))
