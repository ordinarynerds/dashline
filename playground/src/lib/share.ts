import { compressToBase64, decompressFromBase64 } from 'lz-string'
import { defaultLines, defaultSettings, type Line, type Settings } from './dashline'

// The builder state persisted to the URL, so a refresh restores it and the link can be shared.
export interface ShareState {
  settings: Settings
  lines: Line[]
}

export const SHARE_PARAM = 'c'

// Compact wire shape: only the settings that differ from defaults, under short keys, then
// LZ-compressed. That keeps the shared link short even though the state is a nested object.
interface Wire {
  s?: Partial<Settings>
  l: Line[]
}

const urlSafe = (b64: string) => b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromUrlSafe = (s: string) => s.replace(/-/g, '+').replace(/_/g, '/')

// Drop keys equal to their default so the common case (mostly-default settings) barely adds bytes.
function trimSettings(settings: Settings): Partial<Settings> {
  const d = defaultSettings()
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(settings) as (keyof Settings)[]) {
    if (settings[key] !== d[key]) out[key] = settings[key]
  }
  return out as Partial<Settings>
}

export function encodeShareState(settings: Settings, lines: Line[]): string {
  const trimmed = trimSettings(settings)
  const wire: Wire = { l: lines }
  if (Object.keys(trimmed).length) wire.s = trimmed
  return urlSafe(compressToBase64(JSON.stringify(wire)))
}

// Decodes a share param back into builder state, merging over defaults so a partial or older
// payload still hydrates cleanly. Returns null on anything malformed.
export function decodeShareState(param: string | null | undefined): ShareState | null {
  if (!param) return null
  try {
    const json = decompressFromBase64(fromUrlSafe(param))
    if (!json) return null
    const wire = JSON.parse(json) as Partial<Wire>
    if (!wire || typeof wire !== 'object') return null
    return {
      settings: { ...defaultSettings(), ...(wire.s ?? {}) },
      lines: Array.isArray(wire.l) && wire.l.length ? wire.l : defaultLines(),
    }
  } catch {
    return null
  }
}

export function readShareParam(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(SHARE_PARAM)
}

// Writes the config onto the current URL without adding a history entry, keeping it a
// refresh-safe, shareable link.
export function writeShareParam(value: string): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set(SHARE_PARAM, value)
  window.history.replaceState(window.history.state, '', url)
}
