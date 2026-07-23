#!/usr/bin/env bash
# selftest.sh — feed sample payloads to dashline.sh and assert on the output.
# Usage: tests/selftest.sh   (exit 0 = all pass)
set -u

DIR=$(cd "$(dirname "$0")/.." && pwd)
SL="$DIR/statusline/dashline.sh"
pass=0; fail=0
now=$(date +%s 2>/dev/null || echo 1700000000)
r5=$(( now + 14220 ))   # ~3h57m
r7=$(( now + 320000 ))  # ~3d

# strip ANSI so assertions match on plain text
plain() { perl -CS -pe 's/\x1b\[[0-9;]*m//g'; }

check() { # <description> <payload> <substring-that-must-appear>
  local desc="$1" payload="$2" want="$3" out
  out=$(printf '%s' "$payload" | COLUMNS=130 "$SL" | plain)
  if printf '%s' "$out" | grep -qF -- "$want"; then
    pass=$((pass+1)); printf '  ok   %s\n' "$desc"
  else
    fail=$((fail+1)); printf '  FAIL %s\n       want substring: %s\n       got: %s\n' "$desc" "$want" "$out"
  fi
}

echo "dashline selftest"

check "model name + green context" \
  '{"model":{"display_name":"Opus 4.8 (1M context)"},"context_window":{"used_percentage":16,"total_input_tokens":160000,"context_window_size":1000000}}' \
  'Opus 4.8 16%'

check "high heads-up at 44%" \
  '{"context_window":{"used_percentage":44,"total_input_tokens":440000,"context_window_size":1000000}}' \
  '· high'

check "compact nudge at/above 50%" \
  '{"context_window":{"used_percentage":50,"total_input_tokens":500000,"context_window_size":1000000}}' \
  '→ /compact [next goal/task]'

check "percentage computed when used_percentage absent (150k/200k=75%)" \
  '{"context_window":{"total_input_tokens":150000,"context_window_size":200000}}' \
  '75%'

check "usage: session + All from rate_limits" \
  '{"context_window":{"used_percentage":10,"total_input_tokens":100000,"context_window_size":1000000},"rate_limits":{"five_hour":{"used_percentage":6,"resets_at":'"$r5"'},"seven_day":{"used_percentage":19,"resets_at":'"$r7"'}}}' \
  'session 6%'

check "usage: weekly labelled All" \
  '{"context_window":{"used_percentage":10,"total_input_tokens":100000,"context_window_size":1000000},"rate_limits":{"five_hour":{"used_percentage":6,"resets_at":'"$r5"'},"seven_day":{"used_percentage":19,"resets_at":'"$r7"'}}}' \
  'All 19%'

check_out=$(printf '%s' '{"model":{"display_name":"Opus 4.8"},"context_window":{"used_percentage":10,"total_input_tokens":100000,"context_window_size":1000000},"rate_limits":{"five_hour":{"used_percentage":6,"resets_at":'"$r5"'}}}' | DASHLINE_USAGE=0 COLUMNS=130 "$SL" | plain)
if printf '%s' "$check_out" | grep -qF 'session'; then fail=$((fail+1)); printf '  FAIL usage hidden with DASHLINE_USAGE=0\n'; else pass=$((pass+1)); printf '  ok   usage hidden with DASHLINE_USAGE=0\n'; fi

check "graceful null context after /compact" \
  '{"model":{"display_name":"Opus 4.8"},"context_window":null}' \
  'Opus 4.8 --'

# This repo is a git checkout, so pointing current_dir at it should surface a branch.
check "git branch shown for a repo dir" \
  '{"model":{"display_name":"Opus 4.8"},"workspace":{"current_dir":"'"$DIR"'"},"context_window":{"used_percentage":10,"total_input_tokens":100000,"context_window_size":1000000}}' \
  '⎇'

git_out=$(printf '%s' '{"model":{"display_name":"Opus 4.8"},"workspace":{"current_dir":"/"},"context_window":{"used_percentage":10,"total_input_tokens":100000,"context_window_size":1000000}}' | DASHLINE_GIT=0 COLUMNS=130 "$SL" | plain)
if printf '%s' "$git_out" | grep -qF '⎇'; then fail=$((fail+1)); printf '  FAIL git hidden with DASHLINE_GIT=0\n'; else pass=$((pass+1)); printf '  ok   git hidden with DASHLINE_GIT=0\n'; fi

echo "-----"
printf '%d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
