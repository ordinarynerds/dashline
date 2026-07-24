import { useEffect } from 'react'
import { create } from 'zustand'
import { SCENARIOS } from '@/lib/dashline'

// Playback state for the terminal preview: which sample scenario is showing and whether it is
// advancing on its own. Kept in a small Zustand store so the controls and the terminal share one
// source of truth without threading props through the preview tree.
interface PreviewState {
  index: number
  playing: boolean
  speedMs: number
  next: () => void
  prev: () => void
  setIndex: (i: number) => void
  play: () => void
  pause: () => void
  toggle: () => void
}

const wrap = (i: number) => ((i % SCENARIOS.length) + SCENARIOS.length) % SCENARIOS.length

export const usePreviewStore = create<PreviewState>((set) => ({
  index: 0,
  playing: false,
  speedMs: 1600,
  next: () => set((s) => ({ index: wrap(s.index + 1) })),
  prev: () => set((s) => ({ index: wrap(s.index - 1) })),
  setIndex: (i) => set({ index: wrap(i) }),
  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),
  toggle: () => set((s) => ({ playing: !s.playing })),
}))

// Advances the scenario on an interval while playing. Lives in an effect (not the store) so the
// timer is tied to a mounted component and cleaned up on unmount or pause.
export function usePreviewAutoplay() {
  const playing = usePreviewStore((s) => s.playing)
  const speedMs = usePreviewStore((s) => s.speedMs)
  const next = usePreviewStore((s) => s.next)
  useEffect(() => {
    if (!playing) return
    const id = setInterval(next, speedMs)
    return () => clearInterval(id)
  }, [playing, speedMs, next])
}
