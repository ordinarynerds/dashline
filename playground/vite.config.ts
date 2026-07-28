import { readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The version the About page reports. Read from the root package.json, which release-please owns,
// so the site cannot drift from the release it documents. The playground's own package.json is
// unversioned (0.0.0) and would be the wrong number to print.
const { version } = JSON.parse(readFileSync(path.resolve(__dirname, '../package.json'), 'utf8')) as { version: string }

// The changelog, parsed from the file release-please writes. Parsing at build time rather than
// hand-maintaining a second copy means the page is correct by construction: a release updates
// CHANGELOG.md, and the next deploy picks it up with no edit here.
//
// Kept out of src/ deliberately — CHANGELOG.md lives above the Vite root, so importing it as an
// asset would need fs.allow widened. Reading it in Node has no such problem.
interface ChangeItem {
  text: string
  scope?: string
  sha?: string
  url?: string
}
interface ChangeGroup {
  title: string
  items: ChangeItem[]
}
interface Release {
  version: string
  date: string
  compare: string | null
  groups: ChangeGroup[]
}

// release-please's shape:  ## [0.10.0](compare-url) (2026-07-24) / ### Features / * text ([sha](url))
const HEADING = /^## \[?([^\]\s]+)\]?(?:\(([^)]+)\))?\s*\((\d{4}-\d{2}-\d{2})\)/
const GROUP = /^### (.+)$/
const ITEM = /^\* (.+)$/
const TRAILING_SHA = /^(.*?)\s*\(\[([0-9a-f]{6,})\]\(([^)]+)\)\)\s*$/
// A scoped commit is written `**playground:** description`. Left as-is the asterisks render
// literally, so the scope is lifted out and the page draws it as a label.
const SCOPE = /^\*\*(.+?):\*\*\s*(.*)$/

function parseChangelog(md: string): Release[] {
  const releases: Release[] = []
  let release: Release | undefined
  let group: ChangeGroup | undefined

  for (const line of md.split('\n')) {
    const heading = HEADING.exec(line)
    if (heading) {
      release = { version: heading[1]!, compare: heading[2] ?? null, date: heading[3]!, groups: [] }
      releases.push(release)
      group = undefined
      continue
    }
    const groupHeading = GROUP.exec(line)
    if (groupHeading && release) {
      group = { title: groupHeading[1]!.trim(), items: [] }
      release.groups.push(group)
      continue
    }
    const item = ITEM.exec(line)
    if (item && group) {
      const withSha = TRAILING_SHA.exec(item[1]!)
      const entry: ChangeItem = withSha
        ? { text: withSha[1]!, sha: withSha[2]!.slice(0, 7), url: withSha[3]! }
        : { text: item[1]! }
      const scoped = SCOPE.exec(entry.text)
      if (scoped) {
        entry.scope = scoped[1]!
        entry.text = scoped[2]!
      }
      group.items.push(entry)
    }
  }
  return releases
}

const changelog = parseChangelog(readFileSync(path.resolve(__dirname, '../CHANGELOG.md'), 'utf8'))

// Where the site is served from. Social cards need absolute URLs, so index.html carries a %SITE%
// token that the plugin below fills in. Overridable for preview deploys; the default is the only
// host that serves this app.
const SITE = process.env.DASHLINE_SITE ?? 'https://dashline.ordinarynerds.com'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'dashline:site-url',
      transformIndexHtml: (html) => html.replaceAll('%SITE%', SITE),
    },
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  define: {
    __DASHLINE_VERSION__: JSON.stringify(version),
    __DASHLINE_CHANGELOG__: JSON.stringify(changelog),
  },
})
