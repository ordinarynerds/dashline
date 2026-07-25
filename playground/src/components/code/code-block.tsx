import { type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { SYNTAX, colorOf, type ColorName } from '@/lib/dashline'
import { useClipboard } from '@/hooks/use-clipboard'
import { cn } from '@/lib/utils'

export type Lang = 'json' | 'jsonc' | 'shell' | 'text'

// The Ordinary Nerds JSON palette, extended with a comment tone. Shared by the config output
// panel and the docs so every code block reads the same.
const TONE: Record<string, ColorName> = { ...SYNTAX, comment: 'dim', cmd: 'cyan', flag: 'yellow' }

function span(text: string, kind: keyof typeof TONE, key: number): ReactNode {
  return (
    <span key={key} style={{ color: colorOf(TONE[kind] ?? 'white', '') }}>
      {text}
    </span>
  )
}

const JSON_TOKEN = /(\/\/[^\n]*)|("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b|([{}[\],:])/g

export function highlightJson(code: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let last = 0
  let key = 0
  JSON_TOKEN.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = JSON_TOKEN.exec(code)) !== null) {
    if (m.index > last) nodes.push(code.slice(last, m.index))
    if (m[1]) nodes.push(span(m[1], 'comment', key++))
    else if (m[2] && m[3]) {
      nodes.push(span(m[2], 'key', key++))
      nodes.push(span(m[3], 'punct', key++))
    } else if (m[2]) nodes.push(span(m[2], 'str', key++))
    else if (m[4]) nodes.push(span(m[4], 'num', key++))
    else if (m[5]) nodes.push(span(m[5], 'bool', key++))
    else if (m[6]) nodes.push(span(m[6], 'punct', key++))
    last = JSON_TOKEN.lastIndex
  }
  if (last < code.length) nodes.push(code.slice(last))
  return nodes
}

// A terminal-flavored highlighter: the leading word of each command is the command, then flags,
// strings, operators, and comments.
function highlightShell(code: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let key = 0
  code.split('\n').forEach((line, li) => {
    if (li > 0) nodes.push('\n')
    if (line.trim().startsWith('#')) {
      nodes.push(span(line, 'comment', key++))
      return
    }
    let expectCommand = true
    for (const part of line.split(/(\s+)/)) {
      if (part === '') continue
      if (/^\s+$/.test(part)) {
        nodes.push(part)
        continue
      }
      if (part === '&&' || part === '||' || part === '|' || part === ';') {
        nodes.push(span(part, 'punct', key++))
        expectCommand = true
      } else if (expectCommand) {
        nodes.push(span(part, 'cmd', key++))
        expectCommand = false
      } else if (/^-/.test(part)) nodes.push(span(part, 'flag', key++))
      else if (/^["']/.test(part)) nodes.push(span(part, 'str', key++))
      else nodes.push(part)
    }
  })
  return nodes
}

function render(code: string, lang: Lang): ReactNode[] {
  if (lang === 'shell') return highlightShell(code)
  if (lang === 'text') return [code]
  return highlightJson(code)
}

// A syntax-highlighted code block for the docs, colored from the dashline palette.
//
// Square, like the terminal and the palette rows: every surface in this app that holds literal
// machine text is square, and a code block is the most literal of them.
//
// `title` names what the block *is* — a file path, or the shell it runs in. On a page where four
// blocks look alike, "~/.claude/settings.json" is the difference between reading and guessing.
export function CodeBlock({
  code,
  lang = 'json',
  title,
  className,
}: {
  code: string
  lang?: Lang
  title?: string
  className?: string
}) {
  const { copied, copy } = useClipboard()

  return (
    <div className={cn('group/code relative border border-white/10 bg-black', className)}>
      {title ? (
        <div className="border-b border-white/10 px-3 py-1.5 pr-11">
          <span className="block truncate font-mono text-[11px] text-muted-foreground">{title}</span>
        </div>
      ) : null}
      <pre className="scrollbar-hide overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        <code>{render(code, lang)}</code>
      </pre>
      {/* Always present, never loud. Hover-to-reveal is the common pattern and it hides the one
          control these pages exist to offer — the install commands are here to be taken. */}
      <button
        type="button"
        onClick={() => copy(code)}
        aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
        className={cn(
          'absolute top-2 right-2 flex size-7 items-center justify-center rounded-sm transition-colors duration-150 ease-[var(--ease-out)]',
          copied
            ? 'text-[#35d13b]'
            : 'text-muted-foreground/60 hover:bg-white/10 hover:text-foreground group-hover/code:text-muted-foreground',
        )}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  )
}
