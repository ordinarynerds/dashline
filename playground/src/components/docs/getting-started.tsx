import { Link } from '@tanstack/react-router'
import { Blocks } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/code/code-block'
import { DocPage, DocSection } from './doc-page'

const DEFAULT_CONFIG = `{
  "dashline": {
    "lines": [
      { "left": ["branch", "model", "context"], "right": ["session", "weekly"] }
    ]
  }
}`

const ITEM_SHAPES = `"branch"                                       // widget
["model", "cyan"]                              // widget + color
["cwd", "basename"]                            // widget + variant
["session", { "bar": "fine", "label": "5h" }]  // widget + options
{ "text": "api", "color": "dim" }              // literal text
"kache stat"                                   // unrecognized string runs as a shell command`

export function GettingStarted() {
  return (
    <DocPage
      title="Getting started"
      lead="A Claude Code status line configured in settings.json. The default shows the context window on the left and plan usage on the right. Change it by editing a list of fields."
      next={{ to: '/install', title: 'Install', hint: 'Two routes, both ending at settings.json' }}
    >
      <DocSection title="Why">
        <p>
          dashline keeps two numbers on screen: how full the context window is, and how much of the session and weekly rate limit is
          used. Both otherwise live behind the <code>/usage</code> command. Any other field in the payload can be added by name.
        </p>
      </DocSection>

      <DocSection title="Quick start">
        <p>
          The config is a <code>dashline</code> key in <code>~/.claude/settings.json</code>. Each entry in <code>lines</code> is one
          row. This is the default:
        </p>
        <CodeBlock code={DEFAULT_CONFIG} lang="json" title="~/.claude/settings.json" />
      </DocSection>

      <DocSection title="Items">
        <p>An item is one of six shapes:</p>
        <CodeBlock code={ITEM_SHAPES} lang="jsonc" />
        <p>
          A row is either a bare array like <code>["branch", "model"]</code> (left-aligned), or a{' '}
          <code>{'{ "left": [...], "center": [...], "right": [...] }'}</code> object spread across the width.
        </p>
      </DocSection>

      <DocSection title="Build it visually">
        <p>
          The Build tab is a drag-and-drop editor for exactly this config. Drop widgets into zones, set colors and variants, tune
          thresholds, and copy the result straight into your settings — no install required to try it.
        </p>
        <Button asChild className="mt-1 w-fit gap-2">
          <Link to="/build">
            <Blocks className="size-4" /> Open the builder
          </Link>
        </Button>
      </DocSection>
    </DocPage>
  )
}
