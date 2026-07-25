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
      next={{ to: '/build', title: 'Build your status line', hint: 'Drag widgets into zones and copy the config' }}
    >
      {/* The recommendation was a parenthetical in a heading, and the two routes were rendered
          identically — nothing on screen said which one to take. Marking it costs one badge and
          decides the page for most readers. */}
      <DocSection title="As a plugin">
        <p>
          <Recommended /> Three commands in Claude Code. The last one writes <code>settings.json</code> for you.
        </p>
        <CodeBlock code={PLUGIN} lang="shell" title="Claude Code" />
      </DocSection>

      <DocSection title="Manual">
        <p>Clone, build, and run the installer yourself. Requires Node 18+.</p>
        <CodeBlock code={MANUAL} lang="shell" title="Terminal" />
        <p>
          The installer backs up <code>settings.json</code>, points <code>statusLine</code> at <code>node dist/dashline.js</code>, and
          leaves a <code>settings.json.bak-dashline-*</code> file. Undo with <code>./scripts/install.sh --uninstall</code>. Start a
          new session or run <code>/statusline</code> to see it.
        </p>
      </DocSection>

      <DocSection title="Updating">
        <p>
          On the plugin route, enable auto-update in <code>/plugin</code> (Marketplaces tab), or pull on demand:
        </p>
        <CodeBlock code={UPDATE_PLUGIN} lang="shell" title="Claude Code" />
        <p>On the manual route:</p>
        <CodeBlock code={UPDATE_MANUAL} lang="shell" title="Terminal" />
      </DocSection>
    </DocPage>
  )
}

function Recommended() {
  return (
    <span className="mr-1.5 inline-flex -translate-y-px items-center rounded-sm bg-primary/15 px-1.5 py-0.5 align-middle text-[10px] font-semibold tracking-[0.1em] text-primary uppercase">
      Recommended
    </span>
  )
}
