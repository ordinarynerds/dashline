# dashline

A Claude Code status line in two halves: how full your context window is on the left,
how much of your subscription you've spent on the right. It tells you to `/compact`
before quality drops, and shows how much session and weekly budget you have left,
without opening `/usage`.

![Dashline in a Claude Code terminal across its ok, high, and compact states](assets/dashline.png)

## Why

Two things go wrong in a long Claude Code session:

- The context window fills up. Past a point the model starts dropping detail, and you
  want to `/compact`, but by the time you notice you're already there.
- You run into a rate limit you didn't see coming, because the numbers live behind the
  `/usage` command instead of in front of you.

dashline puts both on screen at all times. The context bar turns yellow, then red with
a `→ /compact` prompt. The usage side counts down to your next session reset.

## Install

A Claude Code plugin can't set the main status line on its own, so either way ends with
`settings.json` pointing at the script. The plugin route runs that step for you.

### As a plugin (recommended)

```
/plugin marketplace add ordinarynerds/dashline
/plugin install dashline@ordinarynerds
/dashline:install
```

`/dashline:install` backs up `settings.json` and points your status line at the
installed script. Start a new session (or run `/statusline`) to see it.

### Manual

Clone it and run the installer:

```bash
git clone https://github.com/ordinarynerds/dashline.git ~/.claude/dashline
~/.claude/dashline/scripts/install.sh
```

Or set it by hand in `~/.claude/settings.json`, using the absolute path to the script:

```json
{
  "statusLine": {
    "type": "command",
    "command": "/Users/you/.claude/dashline/statusline/dashline.sh",
    "refreshInterval": 1
  }
}
```

To remove it, run `scripts/install.sh --uninstall`, or restore the
`settings.json.bak-dashline-*` backup the installer leaves behind.

**Requirements:** `bash`, `jq`, and `awk` (present on macOS and most Linux). `perl` is
used for right-justifying the usage half; without it the two halves fall back to a
fixed gap.

## Reading it

```
Opus 4.8 44% ████░░░░░░ (440k/1.0M) · high        session 61% (↻2h11m) · All 74%
```

**Left: context window**

- `Opus 4.8`: the current model.
- `44% ████░░░░░░`: how full the window is. Green under 40%, yellow ("high") from 40%,
  red with `→ /compact [next goal/task]` from 50%. `[next goal/task]` is a reminder that
  `/compact` takes an instruction: tell it what you're about to do next.
- `(440k/1.0M)`: tokens in context over the window size.

**Right: subscription usage** (Pro/Max only)

- `session 61%`: the rolling 5-hour window, the same "current session" `/usage` shows.
- `(↻2h11m)`: time until that session resets, counting down live.
- `All 74%`: the 7-day weekly limit across all models.

Usage numbers go yellow at 70% and red at 90%.

## Configuration

Every knob is an environment variable, read at each refresh. Set them where Claude Code
picks up your environment, or edit the defaults at the top of `dashline.sh`.

| Variable                | Default | Effect                                        |
|-------------------------|---------|-----------------------------------------------|
| `DASHLINE_WARN`         | `40`    | context turns yellow ("high") at/above this % |
| `DASHLINE_COMPACT`      | `50`    | context turns red with `→ /compact` here      |
| `DASHLINE_WIDTH`        | `10`    | context bar width, in characters              |
| `DASHLINE_USAGE`        | `1`     | set to `0` to hide the usage half             |
| `DASHLINE_USAGE_WARN`   | `70`    | usage % turns yellow at/above this            |
| `DASHLINE_USAGE_CRIT`   | `90`    | usage % turns red at/above this               |
| `DASHLINE_MARGIN`       | `5`     | columns left free at the right edge           |
| `DASHLINE_COLS`         | auto    | override terminal width for justification     |
| `DASHLINE_CANARY`       | `0`     | set to `1` to append another status script    |

If the right half ever gets cut off with a `…`, raise `DASHLINE_MARGIN`.

## How it works

Claude Code hands the status-line command a JSON payload on stdin. dashline reads it and
prints one line: no network calls, no transcript parsing, nothing that drifts out of
sync between releases.

- Context comes from `context_window` (`used_percentage`, `total_input_tokens`,
  `context_window_size`) and `model.display_name`. When it's `null` (right after a
  `/compact`, or before the first response), the left side shows `--`.
- Usage comes from `rate_limits.five_hour` and `rate_limits.seven_day`, each with a
  `used_percentage` and a `resets_at` epoch. These appear for Pro/Max accounts after the
  first response of a session.

The payload carries only those two windows, so there's no per-model weekly breakdown to
show. Every field is optional; a missing one just drops its part of the line.

### Running alongside another status line

If you already run a status-line script, set `DASHLINE_CANARY=1` and dashline will pass
the same stdin to `~/.claude/scripts/canary-cage.sh` and append its output on the right.

## License

MIT © Ordinary Nerds. See [LICENSE](LICENSE).
