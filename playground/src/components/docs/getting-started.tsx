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
    >
      <DocSection title="Why">
        <p className="text-sm text-muted-foreground">
          dashline keeps two numbers on screen: how full the context window is, and how much of the session and weekly rate limit is
          used. Both otherwise live behind the <code className="text-foreground">/usage</code> command. Any other field in the payload
          can be added by name.
        </p>
      </DocSection>

      <DocSection title="Quick start">
        <p className="text-sm text-muted-foreground">
          The config is a <code className="text-foreground">dashline</code> key in <code className="text-foreground">~/.claude/settings.json</code>.
          Each entry in <code className="text-foreground">lines</code> is one row. This is the default:
        </p>
        <CodeBlock code={DEFAULT_CONFIG} lang="json" />
      </DocSection>

      <DocSection title="Items">
        <p className="text-sm text-muted-foreground">An item is one of six shapes:</p>
        <CodeBlock code={ITEM_SHAPES} lang="jsonc" />
        <p className="text-sm text-muted-foreground">
          A row is either a bare array like <code className="text-foreground">["branch", "model"]</code> (left-aligned), or a{' '}
          <code className="text-foreground">{'{ "left": [...], "center": [...], "right": [...] }'}</code> object spread across the width.
        </p>
      </DocSection>

      <DocSection title="Build it visually">
        <p className="text-sm text-muted-foreground">
          The Build tab is a drag-and-drop editor for exactly this config. Drop widgets into zones, set colors and variants, tune
          thresholds, and copy the result straight into your settings.
        </p>
        <Button asChild className="w-fit gap-2">
          <Link to="/build">
            <Blocks className="size-4" /> Open the builder
          </Link>
        </Button>
      </DocSection>
    </DocPage>
  )
}
