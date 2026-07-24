const ANSI = /\x1b\[[0-9;]*m/g

export function visibleWidth(text: string): number {
  return [...text.replace(ANSI, '')].length
}

export function strip(text: string): string {
  return text.replace(ANSI, '')
}
