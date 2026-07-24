#!/usr/bin/env bash
# install.sh — point Claude Code's status line at dashline (edits settings.json).
# Resolves its own location, so it works from a clone or an installed plugin.
# Backs up settings.json first. Undo with --uninstall or restore the .bak file.
set -eu

SELF="${BASH_SOURCE[0]:-$0}"
DIR=$(cd "$(dirname "$SELF")/.." && pwd)
ENTRY="$DIR/dist/dashline.js"

CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
SETTINGS="$CONFIG_DIR/settings.json"

command -v node >/dev/null 2>&1 || { echo "dashline: node is required (https://nodejs.org)."; exit 1; }
[ -f "$ENTRY" ] || { echo "dashline: cannot find $ENTRY (run 'npm run build' first)."; exit 1; }

mkdir -p "$CONFIG_DIR"
[ -f "$SETTINGS" ] || echo '{}' > "$SETTINGS"

ts=$(date +%Y%m%d-%H%M%S)
backup="$SETTINGS.bak-dashline-$ts"
cp "$SETTINGS" "$backup"

MODE=install
[ "${1:-}" = "--uninstall" ] && MODE=uninstall

DASHLINE_SETTINGS="$SETTINGS" DASHLINE_ENTRY="$ENTRY" DASHLINE_MODE="$MODE" node <<'NODE'
const fs = require('node:fs')
const settings = process.env.DASHLINE_SETTINGS
const command = `node ${JSON.stringify(process.env.DASHLINE_ENTRY)}`

let json
try {
  json = JSON.parse(fs.readFileSync(settings, 'utf8') || '{}')
} catch {
  console.error(`dashline: ${settings} is not valid JSON; not touching it.`)
  process.exit(1)
}

const write = () => fs.writeFileSync(settings, `${JSON.stringify(json, null, 2)}\n`)

if (process.env.DASHLINE_MODE === 'uninstall') {
  const cur = json.statusLine?.command ?? ''
  if (cur.includes('dashline')) {
    delete json.statusLine
    write()
    console.log('dashline: removed from status line.')
  } else {
    console.log(`dashline: status line isn't dashline ("${cur}"); left it alone.`)
  }
  process.exit(0)
}

const existing = json.statusLine?.command
if (existing && !existing.includes('dashline')) {
  console.log(`dashline: replacing your current status line:\n    ${existing}`)
}
json.statusLine = { type: 'command', command, refreshInterval: 1 }
write()
console.log(`dashline installed -> ${command}`)
NODE

echo "Start a new session (or run /statusline) to see it. Backup: $backup"
