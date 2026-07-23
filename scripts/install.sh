#!/usr/bin/env bash
# install.sh — point Claude Code's status line at dashline (edits settings.json).
# Works whether you cloned the repo or installed dashline as a plugin: the script
# resolves its own location and wires that copy in. Backs up settings.json first.
#
#   Uninstall: restore the printed .bak-dashline-* file, or run this with --uninstall.
set -eu

SELF="${BASH_SOURCE[0]:-$0}"
DIR=$(cd "$(dirname "$SELF")/.." && pwd)
SCRIPT="$DIR/statusline/dashline.sh"

CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
SETTINGS="$CONFIG_DIR/settings.json"

command -v jq >/dev/null 2>&1 || { echo "dashline: jq is required (e.g. 'brew install jq')."; exit 1; }

mkdir -p "$CONFIG_DIR"
[ -f "$SETTINGS" ] || echo '{}' > "$SETTINGS"
jq -e . "$SETTINGS" >/dev/null 2>&1 || { echo "dashline: $SETTINGS is not valid JSON; not touching it."; exit 1; }

ts=$(date +%Y%m%d-%H%M%S)
backup="$SETTINGS.bak-dashline-$ts"
cp "$SETTINGS" "$backup"
tmp=$(mktemp)

if [ "${1:-}" = "--uninstall" ]; then
  # Remove the status line only if it currently points at dashline.
  cur=$(jq -r '.statusLine.command // empty' "$SETTINGS")
  case "$cur" in
    *dashline.sh) jq 'del(.statusLine)' "$SETTINGS" > "$tmp" && mv "$tmp" "$SETTINGS"
                  echo "dashline: removed from status line (backup: $backup)." ;;
    *) rm -f "$tmp"; echo "dashline: status line isn't dashline (\"$cur\"); left it alone."; exit 0 ;;
  esac
  exit 0
fi

[ -f "$SCRIPT" ] || { echo "dashline: cannot find $SCRIPT"; exit 1; }
chmod +x "$SCRIPT" 2>/dev/null || true

existing=$(jq -r '.statusLine.command // empty' "$SETTINGS")
if [ -n "$existing" ] && [ "$existing" != "$SCRIPT" ]; then
  echo "dashline: replacing your current status line:"
  echo "    $existing"
  echo "  Restore it any time from: $backup"
fi

jq --arg cmd "$SCRIPT" \
  '.statusLine = {type: "command", command: $cmd, refreshInterval: 1}' \
  "$SETTINGS" > "$tmp" && mv "$tmp" "$SETTINGS"

echo "dashline installed -> $SCRIPT"
echo "Start a new session (or run /statusline) to see it."
