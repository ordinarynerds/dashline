import type { Line, Settings, ZoneKey } from '@/lib/dashline'

// The geometry of one composed line, shared by the terminal editor and the read-only previews
// so the two can never disagree about how a line spreads. The editor adds drag chrome on top of
// this; nothing about the shape belongs to it.

// A line with only a left zone hands that zone the whole width, so nothing is pinned to a
// centre or right edge that has no content to balance it.
export const SOLO_ZONE: ZoneKey[] = ['left']

// How a line divides itself. dashline centres the middle zone against the *whole* width —
// `floor((target - cw) / 2)` is an absolute offset, not a share of what the left zone leaves
// over (layout.ts). Equal `1fr` tracks either side reproduce that, and because a `1fr` track
// still grows past its share for content that will not fit, an over-wide left zone pushes the
// middle along rather than overlapping it, which is the same escape the core takes.
export const LINE_BOX = 'grid grid-cols-[1fr_auto_1fr]'

// A solo line has one zone and no divisions to make, so it skips the tracks entirely.
export const SOLO_BOX = 'flex'

// dashline never lets a centred zone touch its neighbours: rather than print them collided it
// re-lays the whole line out, and the branch it falls into still leaves a blank column either
// side (layout.ts). A preview is often narrower than a real terminal, so without that same
// floor the zones run together at widths where the terminal would simply have re-flowed.
// Charged only when there is a centre zone to separate — an empty one needs no gaps.
const CENTER_GAP = 'gap-x-[1ch]'

// Each zone fills its own track and lays its items out against the matching edge.
export const ZONE_BOX: Record<ZoneKey, string> = {
  left: 'flex justify-start',
  center: 'flex justify-center',
  right: 'flex justify-end',
}

export const isSolo = (line: Line): boolean => !line.center.length && !line.right.length

// The container class for one line: tracks, and the gap floor when it is actually dividing
// three zones.
export function lineBox(line: Line): string {
  if (isSolo(line)) return SOLO_BOX
  return line.center.length ? `${LINE_BOX} ${CENTER_GAP}` : LINE_BOX
}

// dashline falls back to " · " when no separator is configured, so an unset separator has to
// preview as that rather than as nothing.
export const separatorOf = (settings: Settings): string => settings.separator || ' · '
