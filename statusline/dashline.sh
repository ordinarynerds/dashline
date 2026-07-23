#!/usr/bin/env bash
# dashline.sh — a two-part Claude Code status line, justified across the width:
#
#   LEFT  — the context window: model name, %, bar, tokens, and a /compact nudge.
#   RIGHT — subscription usage: session (5-hour) + All (7-day weekly), with a live
#           reset countdown. Same numbers `/usage` shows; straight from the payload.
#
#   Opus 4.8 16% █░░░░░░░░░ (160k/1.0M)              session 5% (↻3h57m) · All 19%
#   Opus 4.8 44% ████░░░░░░ (440k/1.0M) · high       session 61% (↻2h11m) · All 74%
#   Opus 4.8 82% ████████░░ (820k/1.0M) → /compact [next goal/task]   session 92% ...
#
# Context fields (first-party): context_window.{used_percentage,total_input_tokens,
# context_window_size} and model.display_name.  Usage fields (Pro/Max only, after the
# first API response): rate_limits.{five_hour,seven_day}.{used_percentage,resets_at}.
# Every field is optional and degrades gracefully when absent.
#
# Tunables (env):
#   DASHLINE_WARN        context "high" (yellow) at/above this %   (default 40)
#   DASHLINE_COMPACT     context "compact" (red) at/above this %   (default 50)
#   DASHLINE_WIDTH       bar width in chars                        (default 10)
#   DASHLINE_USAGE_WARN  usage % yellow at/above this              (default 70)
#   DASHLINE_USAGE_CRIT  usage % red at/above this                 (default 90)
#   DASHLINE_USAGE       set to 0 to hide the right (usage) half   (default 1/on)
#   DASHLINE_CANARY      set to 1 to append canary-cage.sh output  (default 0/off)
#   DASHLINE_COLS        override terminal width for justification (default auto)
#   DASHLINE_MARGIN      cols kept free at the right edge          (default 5)
set -u

input=$(cat 2>/dev/null)

CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
CANARY="$CONFIG_DIR/scripts/canary-cage.sh"

WARN=${DASHLINE_WARN:-40}
COMPACT=${DASHLINE_COMPACT:-50}
WIDTH=${DASHLINE_WIDTH:-10}
USAGE_WARN=${DASHLINE_USAGE_WARN:-70}
USAGE_CRIT=${DASHLINE_USAGE_CRIT:-90}
SHOW_USAGE=${DASHLINE_USAGE:-1}
SHOW_CANARY=${DASHLINE_CANARY:-0}

GRN=$'\033[32m'; YEL=$'\033[33m'; RED=$'\033[1;31m'
DIM=$'\033[2m'; BOLD=$'\033[1m'; RST=$'\033[0m'

now=$(date +%s 2>/dev/null || echo 0)
HAVE_JQ=0; command -v jq >/dev/null 2>&1 && HAVE_JQ=1
HAVE_PERL=0; command -v perl >/dev/null 2>&1 && HAVE_PERL=1

human() { awk -v n="$1" 'BEGIN{
  if (n=="") { print ""; }
  else if (n>=1000000) printf "%.1fM", n/1000000;
  else if (n>=1000)    printf "%dk", n/1000;
  else                 printf "%d", n;
}'; }

countdown() {  # "resets in" from epoch seconds
  local t="$1" d days hrs mins
  [ -z "$t" ] && return
  d=$(( t - now )); [ "$d" -lt 0 ] && d=0
  days=$(( d / 86400 )); hrs=$(( (d % 86400) / 3600 )); mins=$(( (d % 3600) / 60 ))
  if   [ "$days" -gt 0 ]; then printf '%dd%dh' "$days" "$hrs"
  elif [ "$hrs"  -gt 0 ]; then printf '%dh%02dm' "$hrs" "$mins"
  else                        printf '%dm' "$mins"
  fi
}

usagecolor() {
  if   [ "$1" -ge "$USAGE_CRIT" ]; then printf '%s' "$RED"
  elif [ "$1" -ge "$USAGE_WARN" ]; then printf '%s' "$YEL"
  else                                  printf '%s' "$GRN"
  fi
}

# Visible width of a string: strip ANSI, count Unicode chars (UTF-8 aware via perl).
vislen() {
  printf '%s' "$1" | perl -CS -e 'local $/; my $s=<STDIN>//""; $s =~ s/\x1b\[[0-9;]*m//g; print length($s);' 2>/dev/null
}

# ============================ LEFT: context window ============================
pct=""; used=""; size=""; model=""
if [ "$HAVE_JQ" = 1 ]; then
  IFS='|' read -r pct used size < <(printf '%s' "$input" | jq -r '
    (.context_window // {}) as $c
    | "\($c.used_percentage // "")|\($c.total_input_tokens // $c.current_usage.input_tokens // "")|\($c.context_window_size // "")"' 2>/dev/null)
  # Model name, minus any "(… context)" parenthetical: "Opus 4.8 (1M context)" -> "Opus 4.8".
  model=$(printf '%s' "$input" | jq -r '.model.display_name // ""' 2>/dev/null | sed -E 's/ *\([^)]*\)[[:space:]]*$//')
fi
[ -z "$model" ] && model="ctx"

p_int=""
if [ -n "${pct:-}" ]; then
  p_int=$(printf '%.0f' "$pct" 2>/dev/null)
elif [ -n "${used:-}" ] && [ -n "${size:-}" ]; then
  p_int=$(awk -v u="$used" -v s="$size" 'BEGIN{ if (s>0) printf "%.0f", (u/s)*100 }')
fi

if [ -n "$p_int" ]; then
  [ "$p_int" -lt 0 ] 2>/dev/null && p_int=0
  fill=$(( p_int * WIDTH / 100 ))
  [ "$fill" -gt "$WIDTH" ] && fill="$WIDTH"
  [ "$fill" -lt 0 ] && fill=0

  bar=""; i=0
  while [ "$i" -lt "$WIDTH" ]; do
    if [ "$i" -lt "$fill" ]; then bar="${bar}█"; else bar="${bar}░"; fi
    i=$((i+1))
  done

  hint=""
  if [ "$p_int" -ge "$COMPACT" ]; then
    col=$RED
    hint=" ${RED}${BOLD}→ /compact${RST} ${DIM}[next goal/task]${RST}"
  elif [ "$p_int" -ge "$WARN" ]; then
    col=$YEL
    hint=" ${YEL}· high${RST}"
  else
    col=$GRN
  fi

  toks=""
  [ -n "${used:-}" ] && [ -n "${size:-}" ] && toks=" ${DIM}($(human "$used")/$(human "$size"))${RST}"
  left="${BOLD}${model}${RST} ${col}${BOLD}${p_int}%${RST} ${col}${bar}${RST}${toks}${hint}"
else
  left="${BOLD}${model}${RST} ${DIM}--${RST}"   # null right after /compact or pre-first-call
fi

# ============================ RIGHT: subscription usage ======================
right=""
case "$SHOW_USAGE" in
  1|true|TRUE|yes|on)
    fh_pct=""; fh_reset=""; wk_pct=""
    if [ "$HAVE_JQ" = 1 ]; then
      IFS='|' read -r fh_pct fh_reset wk_pct < <(printf '%s' "$input" | jq -r '
        (.rate_limits // {}) as $r
        | "\($r.five_hour.used_percentage // "")|\($r.five_hour.resets_at // "")|\($r.seven_day.used_percentage // "")"' 2>/dev/null)
    fi
    if [ -n "$fh_pct" ] || [ -n "$wk_pct" ]; then
      seg=""
      if [ -n "$fh_pct" ]; then
        si=$(printf '%.0f' "$fh_pct" 2>/dev/null)
        seg="${DIM}session${RST} $(usagecolor "$si")${si}%${RST}"
        rc=$(countdown "$fh_reset")
        [ -n "$rc" ] && seg="$seg ${DIM}(↻${rc})${RST}"
      fi
      if [ -n "$wk_pct" ]; then
        wi=$(printf '%.0f' "$wk_pct" 2>/dev/null)
        [ -n "$seg" ] && seg="$seg ${DIM} · ${RST}"
        seg="${seg}${DIM}All${RST} $(usagecolor "$wi")${wi}%${RST}"
      fi
      right="$seg"
    fi
    ;;
esac

# Canary (opt-in) rides on the right edge.
case "$SHOW_CANARY" in
  1|true|TRUE|yes|on)
    if [ -x "$CANARY" ]; then
      c=$(printf '%s' "$input" | "$CANARY" 2>/dev/null)
      [ -n "$c" ] && { [ -n "$right" ] && right="$right   $c" || right="$c"; }
    fi
    ;;
esac

# ============================ compose (justified) ============================
# Right-justify to (width - margin). The margin absorbs ambiguous-width glyphs
# (↻ · → and block chars) that some terminals render 2 cols wide while our count
# treats them as 1 — without it the line overflows and Claude Code truncates ("…").
if [ -z "$right" ]; then
  printf '%s\n' "$left"
else
  gap=0
  if [ "$HAVE_PERL" = 1 ]; then                   # width calc needs perl; else fixed gap
    cols=${DASHLINE_COLS:-${COLUMNS:-$(tput cols 2>/dev/null || echo 80)}}
    margin=${DASHLINE_MARGIN:-5}
    target=$(( cols - margin ))
    llen=$(vislen "$left"); rlen=$(vislen "$right")
    : "${llen:=0}"; : "${rlen:=0}"
    gap=$(( target - llen - rlen ))
  fi
  if [ "$gap" -lt 3 ]; then
    printf '%s   %s\n' "$left" "$right"            # too narrow (or no perl): fixed gap
  else
    printf '%s%*s%s\n' "$left" "$gap" '' "$right"
  fi
fi
