const ANSI = /\x1b\[[0-9;]*m/g

export function visibleWidth(text: string): number {
  let width = 0
  for (const ch of text.replace(ANSI, '')) width += charWidth(ch.codePointAt(0)!)
  return width
}

// Truncate to a visible column budget, keeping ANSI codes intact and adding an ellipsis.
export function clip(text: string, width: number): string {
  if (width <= 0) return ''
  if (visibleWidth(text) <= width) return text
  const budget = width - 1
  let out = ''
  let used = 0
  let styled = false
  for (let i = 0; i < text.length; ) {
    if (text[i] === '\x1b') {
      let end = text.indexOf('m', i)
      if (end === -1) end = text.length - 1
      const seq = text.slice(i, end + 1)
      out += seq
      const codes = seq.slice(2, seq.length - 1)
      styled = codes !== '' && codes !== '0'
      i = end + 1
      continue
    }
    const cp = text.codePointAt(i)!
    const w = charWidth(cp)
    if (used + w > budget) break
    out += String.fromCodePoint(cp)
    used += w
    i += String.fromCodePoint(cp).length
  }
  out += '…'
  if (styled) out += '\x1b[0m'
  return out
}

// Approximate terminal column width: 0 for combining and zero-width marks, 2 for East
// Asian wide and fullwidth ranges and the main emoji blocks, 1 otherwise.
function charWidth(cp: number): number {
  if (
    cp === 0x200b ||
    cp === 0x200d ||
    cp === 0xfeff ||
    (cp >= 0x0300 && cp <= 0x036f) ||
    (cp >= 0x1ab0 && cp <= 0x1aff) ||
    (cp >= 0x1dc0 && cp <= 0x1dff) ||
    (cp >= 0x20d0 && cp <= 0x20ff) ||
    (cp >= 0xfe00 && cp <= 0xfe0f) ||
    (cp >= 0xfe20 && cp <= 0xfe2f)
  )
    return 0
  if (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0x303e) ||
    (cp >= 0x3041 && cp <= 0x33ff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0xa000 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe30 && cp <= 0xfe4f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) ||
    (cp >= 0x1f300 && cp <= 0x1faff) ||
    (cp >= 0x20000 && cp <= 0x3fffd)
  )
    return 2
  return 1
}

export function strip(text: string): string {
  return text.replace(ANSI, '')
}
