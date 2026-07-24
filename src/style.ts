const CODES: Record<string, string> = {
  reset: '0',
  bold: '1',
  dim: '2',
  red: '31',
  green: '32',
  yellow: '33',
  blue: '34',
  magenta: '35',
  cyan: '36',
  gray: '90',
}

const RESET = '\x1b[0m'

export type StyleTerm = string

// Control characters, including ESC. Literal text and the separator come from config and
// must never carry raw escapes into the terminal, whatever their source.
const CONTROL = /[\x00-\x1f\x7f]/g

export function paint(text: string, term?: StyleTerm): string {
  if (!term || !text) return text
  const codes = term
    .split(/\s+/)
    .map(codesFor)
    .filter((c): c is string => c !== null)
  if (codes.length === 0) return text
  return `\x1b[${codes.join(';')}m${text}${RESET}`
}

export function isStyle(term: string): boolean {
  return term.split(/\s+/).every((word) => codesFor(word) !== null)
}

// A style word is a named color/attribute or a hex value like #4EC9D6 (or #fff).
function codesFor(word: string): string | null {
  if (word in CODES) return CODES[word]!
  const rgb = hex(word)
  return rgb ? `38;2;${rgb[0]};${rgb[1]};${rgb[2]}` : null
}

function hex(word: string): [number, number, number] | null {
  if (!word.startsWith('#')) return null
  let h = word.slice(1)
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export function sanitize(text: string): string {
  return text.replace(CONTROL, '')
}

export const reset = RESET
