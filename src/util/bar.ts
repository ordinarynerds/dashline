// Every style below uses single-cell glyphs (Block Elements U+2580..U+259F and Box
// Drawing U+2500..U+257F), so a bar is always exactly `width` columns wide. Geometric
// shapes like ● or ▮ are avoided on purpose: they are East Asian "ambiguous width" and
// render double-wide in some terminals, which throws the line out of alignment.

type Glyphs = { full: string; empty: string; wrap?: [string, string] }

const SETS: Record<string, Glyphs> = {
  blocks: { full: '█', empty: '░' },
  shade: { full: '▓', empty: '░' },
  line: { full: '━', empty: '─' },
  ascii: { full: '#', empty: '-', wrap: ['[', ']'] },
}

const EIGHTHS = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉']

export function bar(pct: number, width: number, style = 'blocks'): string {
  const ratio = Math.min(100, Math.max(0, pct)) / 100

  if (style === 'fine') return fine(ratio, width)

  const set = SETS[style] ?? SETS.blocks!
  const inner = set.wrap ? Math.max(0, width - 2) : width
  const fill = Math.round(ratio * inner)
  const body = set.full.repeat(fill) + set.empty.repeat(inner - fill)
  return set.wrap ? set.wrap[0] + body + set.wrap[1] : body
}

// Eighth blocks give 8 sub-cell steps per column for a smooth edge. Working in whole
// eighths keeps the partial index in 0..7 and the total width exactly `width`.
function fine(ratio: number, width: number): string {
  const eighths = Math.round(ratio * width * 8)
  const full = Math.floor(eighths / 8)
  const part = eighths % 8
  const partial = part > 0 && full < width ? EIGHTHS[part] : ''
  const empty = width - full - (partial ? 1 : 0)
  return '█'.repeat(Math.min(full, width)) + partial + '░'.repeat(Math.max(0, empty))
}

export const barStyles = [...Object.keys(SETS), 'fine']
