import { bgCode, bgToFg, fill } from './style.ts'

const ARROW_RIGHT = String.fromCodePoint(0xe0b0)
const ARROW_LEFT = String.fromCodePoint(0xe0b2)
const AUTO_BG = ['#3b3b3b', '#2f2f2f']

export interface Segment {
  text: string
  bg: string | null
}

// Render a zone as a connected powerline ribbon: each segment is padded and filled with a
// background, joined by an arrow whose color fades from one background into the next. A
// segment with no background of its own takes an alternating neutral tone. The right zone
// runs the arrows the other way so the ribbon points back toward the content. Needs a Nerd
// Font for the arrow glyphs.
export function powerlineZone(segs: Segment[], direction: 'left' | 'right' = 'left'): string {
  const resolved = segs.map((s, i) => ({
    text: s.text,
    bg: s.bg ?? bgCode(AUTO_BG[i % AUTO_BG.length]!)!,
  }))

  let out = ''
  if (direction === 'right') {
    resolved.forEach((s, i) => {
      const prev = resolved[i - 1]
      const fg = bgToFg(s.bg)
      out += prev ? `\x1b[${fg};${prev.bg}m${ARROW_LEFT}\x1b[0m` : `\x1b[${fg}m${ARROW_LEFT}\x1b[0m`
      out += fill(` ${s.text} `, s.bg)
    })
    return out
  }

  resolved.forEach((s, i) => {
    out += fill(` ${s.text} `, s.bg)
    const next = resolved[i + 1]
    const fg = bgToFg(s.bg)
    out += next ? `\x1b[${fg};${next.bg}m${ARROW_RIGHT}\x1b[0m` : `\x1b[${fg}m${ARROW_RIGHT}\x1b[0m`
  })
  return out
}
