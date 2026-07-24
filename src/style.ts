const CODES: Record<string, string> = {
  reset: '0',
  bold: '1',
  dim: '2',
  black: '30',
  red: '31',
  green: '32',
  yellow: '33',
  blue: '34',
  magenta: '35',
  cyan: '36',
  white: '37',
  gray: '90',
}

// Named palettes. A theme remaps the color words to hex, so the whole line recolors from
// one cohesive scheme. Set once at startup; attributes (bold, dim) are never themed.
const THEMES: Record<string, Record<string, string>> = {
  nord: { red: '#BF616A', green: '#A3BE8C', yellow: '#EBCB8B', blue: '#81A1C1', magenta: '#B48EAD', cyan: '#88C0D0', gray: '#4C566A', black: '#2E3440', white: '#ECEFF4' },
  dracula: { red: '#FF5555', green: '#50FA7B', yellow: '#F1FA8C', blue: '#6272A4', magenta: '#FF79C6', cyan: '#8BE9FD', gray: '#6272A4', black: '#282A36', white: '#F8F8F2' },
  gruvbox: { red: '#CC241D', green: '#98971A', yellow: '#D79921', blue: '#458588', magenta: '#B16286', cyan: '#689D6A', gray: '#928374', black: '#282828', white: '#EBDBB2' },
  catppuccin: { red: '#F38BA8', green: '#A6E3A1', yellow: '#F9E2AF', blue: '#89B4FA', magenta: '#CBA6F7', cyan: '#94E2D5', gray: '#6C7086', black: '#1E1E2E', white: '#CDD6F4' },
}

let activeTheme: Record<string, string> | null = null

export function setTheme(name: string | undefined): void {
  activeTheme = name && THEMES[name] ? THEMES[name]! : null
}

const RESET = '\x1b[0m'

export type StyleTerm = string

// Control characters, including ESC. Literal text and the separator come from config and
// must never carry raw escapes into the terminal, whatever their source.
const CONTROL = /[\x00-\x1f\x7f]/g

export function paint(text: string, term?: StyleTerm, bg?: string): string {
  if (!text || (!term && !bg)) return text
  const codes: string[] = []
  if (term) codes.push(...term.split(/\s+/).map(codesFor).filter((c): c is string => c !== null))
  if (bg) {
    const b = bgCode(bg)
    if (b) codes.push(b)
  }
  if (codes.length === 0) return text
  return `\x1b[${codes.join(';')}m${text}${RESET}`
}

// A background color: a hex value or one of the named colors (not the attributes).
export function bgCode(word: string): string | null {
  const rgb = themedHex(word)
  if (rgb) return `48;2;${rgb[0]};${rgb[1]};${rgb[2]}`
  const fg = CODES[word]
  return fg && /^(3\d|9\d)$/.test(fg) ? String(Number(fg) + 10) : null
}

// Turn a background SGR code into the matching foreground code (for powerline arrows).
export function bgToFg(bg: string): string {
  if (bg.startsWith('48;2;')) return `38;2;${bg.slice(5)}`
  const n = Number(bg)
  return Number.isFinite(n) ? String(n - 10) : bg
}

// Apply a background across a string, reopening it after every internal reset so nested
// foreground colors do not drop the fill.
export function fill(text: string, bg: string): string {
  const open = `\x1b[${bg}m`
  return open + text.split(RESET).join(`${RESET}${open}`) + RESET
}

export function isStyle(term: string): boolean {
  return term.split(/\s+/).every((word) => codesFor(word) !== null)
}

// A style word is a named color/attribute or a hex value like #4EC9D6 (or #fff).
function codesFor(word: string): string | null {
  const rgb = themedHex(word)
  if (rgb) return `38;2;${rgb[0]};${rgb[1]};${rgb[2]}`
  return word in CODES ? CODES[word]! : null
}

// Resolve a color word to rgb: the active theme's hex for a named color, else the word
// itself if it is a hex value. Attributes and unthemed names fall through to null.
function themedHex(word: string): [number, number, number] | null {
  const themed = activeTheme ? activeTheme[word] : undefined
  return hex(themed ?? word)
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
