import { type ReactNode } from 'react'
import { SYNTAX, colorOf, type ColorName } from '@/lib/dashline'
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
export function CodeBlock({ code, lang = 'json', className }: { code: string; lang?: Lang; className?: string }) {
  return (
    <pre
      className={cn(
        'overflow-x-auto rounded-lg border bg-black p-4 font-mono text-[13px] leading-relaxed scrollbar-hide',
        className,
      )}
    >
      <code>{render(code, lang)}</code>
    </pre>
  )
}
