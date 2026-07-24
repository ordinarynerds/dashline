import { bgCode, bgToFg, fill } from './style.ts'

const ARROW = String.fromCodePoint(0xe0b0)
const AUTO_BG = ['#3b3b3b', '#2f2f2f']

export interface Segment {
  text: string
  bg: string | null
}

// Render a zone as a connected powerline ribbon: each segment is padded and filled with a
// background, joined by an arrow whose color fades from one background into the next. A
// segment with no background of its own takes an alternating neutral tone. Needs a Nerd
// Font for the arrow glyph.
export function powerlineZone(segs: Segment[]): string {
  const resolved = segs.map((s, i) => ({
    text: s.text,
    bg: s.bg ?? bgCode(AUTO_BG[i % AUTO_BG.length]!)!,
  }))

  let out = ''
  resolved.forEach((s, i) => {
    out += fill(` ${s.text} `, s.bg)
    const next = resolved[i + 1]
    const fg = bgToFg(s.bg)
    out += next ? `\x1b[${fg};${next.bg}m${ARROW}\x1b[0m` : `\x1b[${fg}m${ARROW}\x1b[0m`
  })
  return out
}
