const CODES: Record<string, string> = {
  reset: '0',
  bold: '1',
  dim: '2',
  red: '1;31',
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
  const codes = [...new Set(term.split(/\s+/).flatMap((word) => CODES[word]?.split(';') ?? []))]
  if (codes.length === 0) return text
  return `\x1b[${codes.join(';')}m${text}${RESET}`
}

export function isStyle(term: string): boolean {
  return term.split(/\s+/).every((word) => word in CODES)
}

export function sanitize(text: string): string {
  return text.replace(CONTROL, '')
}

export const reset = RESET
