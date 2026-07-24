---
description: Point your Claude Code status line at dashline (backs up settings.json first)
allowed-tools: Bash
---

Install dashline as your status line by running its installer, which backs up
`settings.json` and points `statusLine` at the plugin's copy of the script:

!`bash "${CLAUDE_PLUGIN_ROOT}/scripts/install.sh"`

If that path was empty and nothing ran, locate the dashline plugin directory (the one
containing `dist/dashline.js`) under `~/.claude/plugins/` and run its
`scripts/install.sh`. The installer needs Node on `PATH`.

Then tell me the result, remind me to start a new session or run `/statusline` to see
it, and note that a timestamped `settings.json` backup was made. To undo, run the same
script with `--uninstall`.
