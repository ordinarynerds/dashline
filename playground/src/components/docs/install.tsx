import { CodeBlock } from '@/components/code/code-block'
import { DocPage, DocSection } from './doc-page'

const PLUGIN = `/plugin marketplace add ordinarynerds/dashline
/plugin install dashline@ordinarynerds
/dashline:install`

const MANUAL = `git clone https://github.com/ordinarynerds/dashline.git ~/.claude/dashline
cd ~/.claude/dashline && npm install && npm run build
./scripts/install.sh`

const UPDATE_PLUGIN = `/plugin marketplace update
/reload-plugins`

const UPDATE_MANUAL = `cd ~/.claude/dashline && ./scripts/install.sh --update`

export function Install() {
  return (
    <DocPage
      title="Install"
      lead="A Claude Code plugin cannot set the main status line on its own. Both routes below end with settings.json pointing at dashline; the plugin route does it for you."
    >
      <DocSection title="As a plugin (recommended)">
        <CodeBlock code={PLUGIN} lang="shell" />
      </DocSection>

      <DocSection title="Manual">
        <CodeBlock code={MANUAL} lang="shell" />
        <p className="text-sm text-muted-foreground">
          The installer backs up <code className="text-foreground">settings.json</code>, points{' '}
          <code className="text-foreground">statusLine</code> at <code className="text-foreground">node dist/dashline.js</code>, and leaves
          a <code className="text-foreground">settings.json.bak-dashline-*</code> file. Undo with{' '}
          <code className="text-foreground">./scripts/install.sh --uninstall</code>. Start a new session or run{' '}
          <code className="text-foreground">/statusline</code> to see it. Requires Node 18+.
        </p>
      </DocSection>

      <DocSection title="Updating">
        <p className="text-sm text-muted-foreground">
          Plugin: enable auto-update in <code className="text-foreground">/plugin</code> (Marketplaces tab), or pull on demand:
        </p>
        <CodeBlock code={UPDATE_PLUGIN} lang="shell" />
        <p className="text-sm text-muted-foreground">Manual:</p>
        <CodeBlock code={UPDATE_MANUAL} lang="shell" />
      </DocSection>
    </DocPage>
  )
}
