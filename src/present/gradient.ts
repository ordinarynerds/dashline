import { clampWidth } from '../util/bar.ts'

type Rgb = [number, number, number]

const GREEN: Rgb = [53, 209, 59]
const YELLOW: Rgb = [229, 185, 58]
const RED: Rgb = [255, 85, 85]

type Attrs = { bold?: boolean; italic?: boolean; underline?: boolean }

// A bar whose filled cells ramp green to red across their position, so a fuller bar reads
// hotter. Each cell carries its own truecolor code, so this returns a finished string
// rather than a plain glyph for the caller to paint. Text attributes ride in each cell's
// own escape so the whole bar stays styled across its internal resets.
export function gradientBar(value: number, rawWidth: number, opts: Attrs = {}): string {
  const width = clampWidth(rawWidth)
  const attr = attrCodes(opts)
  const ratio = Math.min(100, Math.max(0, value)) / 100
  const filled = Math.round(ratio * width)
  let out = ''
  for (let i = 0; i < width; i++) {
    if (i < filled) {
      const [r, g, b] = ramp(width === 1 ? 1 : i / (width - 1))
      out += `\x1b[38;2;${r};${g};${b}${attr}m█`
    } else {
      out += `\x1b[0;2${attr}m░`
    }
  }
  return `${out}\x1b[0m`
}

// The enabled bold/italic/underline codes as a `;`-prefixed fragment, folded into each
// cell's SGR so the attribute never rides in an escape separate from the color.
function attrCodes(opts: Attrs): string {
  let s = ''
  if (opts.bold) s += ';1'
  if (opts.italic) s += ';3'
  if (opts.underline) s += ';4'
  return s
}

function ramp(f: number): Rgb {
  return f <= 0.5 ? lerp(GREEN, YELLOW, f / 0.5) : lerp(YELLOW, RED, (f - 0.5) / 0.5)
}

function lerp(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}
