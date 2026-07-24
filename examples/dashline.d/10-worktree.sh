#!/usr/bin/env bash
# Example dashline extra line: the working directory, flagged when it's a linked
# git worktree.  Enable it with:
#
#   mkdir -p ~/.claude/dashline.d
#   cp examples/dashline.d/10-worktree.sh ~/.claude/dashline.d/
#   chmod +x ~/.claude/dashline.d/10-worktree.sh
#
# The contract for any script in ~/.claude/dashline.d/:
#   - dashline runs it once per refresh and pipes it the same JSON payload on
#     stdin (so you can jq out any field yourself).
#   - Whatever it prints on stdout is shown verbatim below the core line. Print
#     more than one line and you get more than one extra row.
#   - dashline exports what it already parsed, so simple scripts skip the jq:
#       DASHLINE_CWD       the workspace dir
#       DASHLINE_BRANCH    current branch (short SHA if detached)
#       DASHLINE_WORKTREE  worktree folder name, empty in the main checkout
#       DASHLINE_PCT       context-window percent, as an integer
set -u
DIM=$'\033[2m'; YEL=$'\033[33m'; RST=$'\033[0m'

dir=${DASHLINE_CWD:-$PWD}
if [ -n "${DASHLINE_WORKTREE:-}" ]; then
  printf '%s⌂ worktree%s %s%s%s\n' "$YEL" "$RST" "$DIM" "$dir" "$RST"
else
  printf '%s%s%s\n' "$DIM" "$dir" "$RST"
fi
