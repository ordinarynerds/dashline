import { useEffect, useReducer } from 'react'
import {
  defaultLines,
  defaultSettings,
  type ItemOption,
  type Line,
  type Settings,
  type ThresholdKey,
  type ZoneKey,
} from '@/lib/dashline'
import { decodeShareState, encodeShareState, readShareParam, writeShareParam } from '@/lib/share'

interface State {
  settings: Settings
  lines: Line[]
}

// A position in the layout: which line, which zone, which slot in that zone.
export interface Loc {
  li: number
  z: ZoneKey
  index: number
}

type Action =
  | { type: 'theme'; theme: string }
  | { type: 'toggle'; key: 'powerline' | 'icons' }
  | { type: 'separator'; value: string }
  | { type: 'margin'; value: number }
  | { type: 'threshold'; key: ThresholdKey; value: number }
  | { type: 'addLine' }
  | { type: 'removeLine'; li: number }
  | { type: 'moveLine'; from: number; to: number }
  | { type: 'reset' }
  | { type: 'removeItem'; li: number; z: ZoneKey; ii: number }
  | { type: 'setOption'; li: number; z: ZoneKey; ii: number; patch: ItemOption }
  | { type: 'insertWidget'; widget: string; to: Loc }
  | { type: 'moveItem'; from: Loc; to: Loc }
  | { type: 'setAll'; settings: Settings; lines: Line[] }

const cloneLines = (lines: Line[]): Line[] =>
  lines.map((l) => ({ left: l.left.map((i) => ({ ...i })), center: l.center.map((i) => ({ ...i })), right: l.right.map((i) => ({ ...i })) }))

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'theme':
      return { ...state, settings: { ...state.settings, theme: action.theme } }
    case 'toggle':
      return { ...state, settings: { ...state.settings, [action.key]: !state.settings[action.key] } }
    case 'separator':
      return { ...state, settings: { ...state.settings, separator: action.value } }
    case 'margin':
      return { ...state, settings: { ...state.settings, margin: action.value } }
    case 'threshold':
      return { ...state, settings: { ...state.settings, [action.key]: action.value } }
    case 'addLine':
      return { ...state, lines: [...state.lines, { left: [], center: [], right: [] }] }
    case 'removeLine': {
      const lines = cloneLines(state.lines)
      lines.splice(action.li, 1)
      return { ...state, lines }
    }
    case 'moveLine': {
      const lines = cloneLines(state.lines)
      const [line] = lines.splice(action.from, 1)
      if (!line) return state
      lines.splice(action.to, 0, line)
      return { ...state, lines }
    }
    case 'reset':
      return { settings: defaultSettings(), lines: defaultLines() }
    case 'setAll':
      // Replace the whole state at once — used when the Code editor parses an edited config.
      return { settings: action.settings, lines: cloneLines(action.lines) }
    case 'removeItem': {
      const lines = cloneLines(state.lines)
      lines[action.li]?.[action.z].splice(action.ii, 1)
      return { ...state, lines }
    }
    case 'setOption': {
      const lines = cloneLines(state.lines)
      const item = lines[action.li]?.[action.z][action.ii]
      if (item) Object.assign(item, action.patch)
      return { ...state, lines }
    }
    case 'insertWidget': {
      const lines = cloneLines(state.lines)
      lines[action.to.li]?.[action.to.z].splice(action.to.index, 0, { widget: action.widget })
      return { ...state, lines }
    }
    case 'moveItem': {
      const lines = cloneLines(state.lines)
      // same-zone moves resolve to one array, so remove-then-insert reorders in place; across
      // zones or lines it hands the item to a different array.
      const src = lines[action.from.li]?.[action.from.z]
      const dst = lines[action.to.li]?.[action.to.z]
      if (!src || !dst) return state
      const [item] = src.splice(action.from.index, 1)
      if (!item) return state
      dst.splice(action.to.index, 0, item)
      return { ...state, lines }
    }
    default:
      return state
  }
}

export interface Playground extends State {
  setTheme(theme: string): void
  toggle(key: 'powerline' | 'icons'): void
  setSeparator(value: string): void
  setMargin(value: number): void
  setThreshold(key: ThresholdKey, value: number): void
  addLine(): void
  removeLine(li: number): void
  moveLine(from: number, to: number): void
  reset(): void
  removeItem(li: number, z: ZoneKey, ii: number): void
  setOption(li: number, z: ZoneKey, ii: number, patch: ItemOption): void
  insertWidget(widget: string, to: Loc): void
  moveItem(from: Loc, to: Loc): void
  setAll(settings: Settings, lines: Line[]): void
}

export function usePlayground(): Playground {
  // Hydrate from a shared/refreshed URL when present, so the builder state survives a reload.
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => decodeShareState(readShareParam()) ?? { settings: defaultSettings(), lines: defaultLines() },
  )

  // Mirror the state back into the URL (on the Build page) so the link stays shareable and a
  // refresh restores exactly what's on screen.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.endsWith('/build')) {
      writeShareParam(encodeShareState(state.settings, state.lines))
    }
  }, [state])

  return {
    ...state,
    setTheme: (theme) => dispatch({ type: 'theme', theme }),
    toggle: (key) => dispatch({ type: 'toggle', key }),
    setSeparator: (value) => dispatch({ type: 'separator', value }),
    setMargin: (value) => dispatch({ type: 'margin', value }),
    setThreshold: (key, value) => dispatch({ type: 'threshold', key, value }),
    addLine: () => dispatch({ type: 'addLine' }),
    removeLine: (li) => dispatch({ type: 'removeLine', li }),
    moveLine: (from, to) => dispatch({ type: 'moveLine', from, to }),
    reset: () => dispatch({ type: 'reset' }),
    removeItem: (li, z, ii) => dispatch({ type: 'removeItem', li, z, ii }),
    setOption: (li, z, ii, patch) => dispatch({ type: 'setOption', li, z, ii, patch }),
    insertWidget: (widget, to) => dispatch({ type: 'insertWidget', widget, to }),
    moveItem: (from, to) => dispatch({ type: 'moveItem', from, to }),
    setAll: (settings, lines) => dispatch({ type: 'setAll', settings, lines }),
  }
}
