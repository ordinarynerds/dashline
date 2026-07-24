import { useEffect, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { jsonSchema } from 'codemirror-json-schema'
import { parseConfig, toConfig } from '@/lib/dashline'
import schema from '@/lib/dashline.schema.json'
import { usePlaygroundContext } from './context'

// Colored settings.json editor for the current builder state, with JSON syntax highlighting and
// live validation against the dashline JSON Schema. Typing valid config pushes it straight back
// into the builder (two-way); invalid or schema-violating JSON is underlined inline while the
// builder is left untouched until it parses again.

// Syntax colors, echoing the terminal palette from @/lib/dashline (keys cyan, strings green,
// numbers yellow, booleans/null coral, punctuation dim).
const highlight = HighlightStyle.define([
  { tag: t.propertyName, color: '#4EC9D6' },
  { tag: t.string, color: '#35D13B' },
  { tag: t.number, color: '#E5B93A' },
  { tag: [t.bool, t.null, t.keyword], color: '#FF6B4A' },
  { tag: [t.separator, t.brace, t.squareBracket, t.punctuation], color: '#6B6B70' },
])

// A minimal dark theme on a black background, matching the app's terminal/code look.
const theme = EditorView.theme(
  {
    '&': { height: '100%', backgroundColor: '#000', color: '#e5e5e5' },
    '&.cm-focused': { outline: 'none' },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
      fontSize: '13px',
      lineHeight: '1.6',
    },
    '.cm-content': { caretColor: '#fff', padding: '8px 0' },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#fff' },
    '.cm-gutters': { backgroundColor: '#000', color: '#3f3f46', border: 'none' },
    '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.03)' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: '#71717a' },
    '.cm-lintRange-error': { backgroundImage: 'none', textDecoration: 'underline wavy #FF5555' },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(255,255,255,0.12)' },
    '.cm-tooltip': { backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#e5e5e5' },
  },
  { dark: true },
)

export function ConfigOutput() {
  const { settings, lines, setAll } = usePlaygroundContext()
  const config = toConfig(settings, lines)

  const container = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  // The last config this editor emitted, so external edits (drag/drop, reset) refresh the doc
  // while the user's own keystrokes are never reformatted out from under the cursor.
  const lastEmitted = useRef(config)
  // Latest setAll, so the mount-time updateListener never calls a stale closure.
  const setAllRef = useRef(setAll)
  setAllRef.current = setAll
  // Set while we replace the document ourselves, so that programmatic change doesn't bounce back
  // into builder state as if the user had typed it.
  const programmatic = useRef(false)

  useEffect(() => {
    if (!container.current) return
    const view = new EditorView({
      parent: container.current,
      state: EditorState.create({
        doc: lastEmitted.current,
        extensions: [
          basicSetup,
          // Bundles @codemirror/lang-json, JSON parse linting, schema validation linting, hover
          // and completion. The whole imported object is the schema for the full settings doc.
          jsonSchema(schema as unknown as Parameters<typeof jsonSchema>[0]),
          syntaxHighlighting(highlight),
          theme,
          EditorView.updateListener.of((update) => {
            if (!update.docChanged || programmatic.current) return
            const result = parseConfig(update.state.doc.toString())
            if (!result.ok) return
            lastEmitted.current = toConfig(result.settings, result.lines)
            setAllRef.current(result.settings, result.lines)
          }),
        ],
      }),
    })
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  // External sync: when the builder changes the config from elsewhere (drag/drop, reset), replace
  // the document — but not mid-typing, and never for a config this editor just emitted itself.
  useEffect(() => {
    const view = viewRef.current
    if (!view || config === lastEmitted.current) return
    if (config === view.state.doc.toString()) return
    programmatic.current = true
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: config } })
    programmatic.current = false
    lastEmitted.current = config
  }, [config])

  return (
    <div className="flex h-full flex-col bg-black">
      <div ref={container} aria-label="settings.json" className="h-full min-h-0" />
    </div>
  )
}
