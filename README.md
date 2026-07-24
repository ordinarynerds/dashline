# dashline

One status line for Claude Code, configured entirely in `settings.json`. No scripting.
It ships working (context window on the left, plan usage on the right), and you reshape
it by listing the fields you want.

![Dashline in a Claude Code terminal across its ok, high, and compact states](assets/dashline.png)

<p align="center">
  <a href="https://x.com/_ordinarynerds"><img src="https://img.shields.io/badge/Follow%20us%20on%20X-%40__ordinarynerds-000000?style=for-the-badge&logo=x&logoColor=white" alt="Follow @_ordinarynerds on X"></a>
</p>

## Why

Two things go wrong in a long Claude Code session: the context window fills up until the
model starts dropping detail, and you hit a rate limit you never saw coming. dashline
keeps both on screen, and lets you add anything else in the payload by naming it.

## Install

A Claude Code plugin can't set the main status line on its own, so either route ends
with `settings.json` pointing at dashline. The plugin route runs that step for you.

### As a plugin (recommended)

```
/plugin marketplace add ordinarynerds/dashline
/plugin install dashline@ordinarynerds
/dashline:install
```

### Manual

```bash
git clone https://github.com/ordinarynerds/dashline.git ~/.claude/dashline
cd ~/.claude/dashline && npm install && npm run build
./scripts/install.sh
```

The installer backs up `settings.json`, points `statusLine` at `node dist/dashline.js`,
and leaves a `settings.json.bak-dashline-*` file. Undo with `./scripts/install.sh
--uninstall`. Start a new session or run `/statusline` to see it. Requires Node 18+.

## Quick start

The whole config is a `dashline` key in `~/.claude/settings.json`. Each entry in `lines`
is one row on screen. This is the default, written out:

```jsonc
{
  "dashline": {
    "lines": [
      { "left": ["branch", "model", "context"], "right": ["session", "weekly"] }
    ]
  }
}
```

An **item** is one of five shapes:

```jsonc
"branch"                                       // a widget
["model", "cyan"]                              // widget + a color
["cwd", "basename"]                            // widget + a variant (a different drawing)
["session", { "bar": "fine", "label": "5h" }]  // widget + options
"kache stat"                                   // any other string runs as a shell command
```

A **row** is either a bare array like `["branch", "model"]` (left-aligned), or a
`{ "left": [...], "center": [...], "right": [...] }` object spread across the width.

That is the entire model. The [reference](#reference) lists every widget and option.

## Recipes

Drop any of these into your `dashline.lines`.

Add cost and an open-PR badge to the right:

```jsonc
{ "left": ["branch", "model", "context"], "right": ["cost", "pr", "session"] }
```

Show usage as bars instead of numbers:

```jsonc
{ "left": ["branch", "context"], "right": [["session", "bar"], ["weekly", "bar"]] }
```

A compact, numbers-only line:

```jsonc
["branch", ["context", "pct"], ["session", "pct"]]
```

Put your own tool on its own row. Command rows get the payload on stdin plus
`$DASHLINE_BRANCH`, `$DASHLINE_WORKTREE`, and `$DASHLINE_CWD`:

```jsonc
[
  { "left": ["branch", "context"], "right": ["session", "weekly"] },
  ["kache stat --branch \"$DASHLINE_BRANCH\""]
]
```

Rename and trim a widget with data options:

```jsonc
["session", { "label": "5h", "countdown": false, "bar": "fine", "width": 16 }]
```

## Reference

### Widgets

Every widget reads one field of the payload and has a data type; the type decides how it
can be drawn. A widget with no data hides itself, and a row left empty is skipped.
Anything not listed here runs as a shell command.

| Widget | Example | Displays | Type |
|---|---|---|---|
| `branch` | `⎇ main` | git branch | label |
| `model` | `Opus 4.8` | model name | label |
| `context` | `44% ████░░░░░░ (440k/1.0M) · high` | model context | percent |
| `session` | `session 61% (↻2h11m)` | session usage and reset | percent |
| `weekly` | `All 74%` | weekly usage | percent |
| `cost` | `$2.69` | session cost | money |
| `duration` | `37m` | wall-clock this session | duration |
| `lines` | `+156 -23` | lines added and removed | delta |
| `pr` | `PR #702` | open PR number | label |
| `review` | `pending` | PR review state | label |
| `worktree` | `⌂ hotfix` | linked worktree | label |
| `cwd` | `~/Development/dashline` | working directory | label |
| `repo` | `dashline` | repository name | label |
| `effort` | `high` | reasoning effort | label |
| `name` | `celestial-vega` | session name | label |
| `output` | `/default` | output style | label |
| `version` | `v2.1.90` | Claude Code version | label |
| `fast` | `fast` | fast mode | flag |
| `thinking` | `thinking` | extended thinking | flag |
| `vim` | `NORMAL` | vim mode | label |
| `agent` | `security-reviewer` | active subagent | label |

`context`, `session`, and `weekly` color themselves by fill (green to red). The usage
pair appears on Pro and Max once the payload carries rate limits.

### Presentations, by type

The type sets the drawings a widget can take, so a drawing works by type, not by widget:
`["session", "bar"]` and `["cost", "cents"]` both do what they say. Pass it as the item's
variant. The first in each row is the default.

| Type | Presentations |
|---|---|
| `percent` | `pct` (`44%`), `bar` (`████░░░░░░`), `gauge` (`▕████░░▏`), `ratio`, `tokens` (`(440k/1.0M)`), plus [bar styles](#bar-styles) |
| `duration` | `short` (`37m`), `long` (`0h37m`), `clock` (`0:37:00`) |
| `money` | `usd` (`$2.69`), `cents` (`269c`), `round` (`$3`) |
| `delta` | `pair` (`+156 -23`), `sum` (`+133`), `added` (`+156`) |
| `label` | `text`, `basename`, `upper`, `lower`, `truncate:N` |
| `flag` | `on` (hidden when off), `onoff` (`fast:off`) |

For `percent`, the default is the fuller line (number, bar, tokens, and countdown as each
is available), which is why `context` and `session` look richer than a bare `bar`.

### Data options

Object-form keys that change what a widget shows rather than how. Combine them with
`variant`, `bar`, and `color`.

| Option | Types | Effect |
|---|---|---|
| `label` | percent | rename the prefix, such as `session` to `5h` |
| `countdown` | percent | set `false` to drop the reset countdown |
| `warn`, `crit` | percent | color thresholds for this item, above the global ones |
| `width` | percent | bar width in columns |
| `bar` | percent | bar glyph style (see [bar styles](#bar-styles)) |
| `truncate` | label | shorten the text to N characters with an ellipsis |
| `icon` | label | a glyph placed before the text |
| `color` | any | a fixed color (see below) |
| `variant` | any | which presentation to draw |

### Colors

A color term is one or more of these words, so `"bold red"` is valid:

`red` · `green` · `yellow` · `blue` · `magenta` · `cyan` · `gray` · `dim` · `bold`

Recoloring an item replaces its whole look. The color-by-fill widgets (`context`,
`session`, `weekly`) lose their meaning when you recolor them, so leave those alone
unless you want a fixed color.

### Bar styles

Any `percent` bar takes a `bar` glyph style. Every style is single-cell, so the bar
stays the same width whichever you pick.

| `bar` | 44% of 10 | |
|---|---|---|
| `blocks` (default) | `████░░░░░░` | sharp |
| `shade` | `▓▓▓▓░░░░░░` | softer fill |
| `line` | `━━━━──────` | thin |
| `ascii` | `[###-----]` | brackets counted inside the width |
| `fine` | `████▍░░░░░` | smooth, 8 sub-cell steps per column |

### Config keys

Alongside `lines`, the `dashline` object takes:

| Key | Default | Effect |
|---|---|---|
| `separator` | `·` | drawn dim between items in a zone |
| `margin` | `5` | columns kept free at the right edge |
| `warn` | `40` | context turns yellow ("high") at/above this % |
| `compact` | `50` | context turns red with `→ /compact` at/above this % |
| `usageWarn` | `70` | usage widgets turn yellow at/above this % |
| `usageCrit` | `90` | usage widgets turn red at/above this % |

## How it works

Claude Code hands the status-line command a JSON payload on stdin. dashline reads it,
reads your `dashline` config from the settings files, and prints one line per entry in
`lines`. No network, no transcript parsing, nothing that drifts between releases.

Each widget is a small pure function from the payload to a typed value, and a presenter
draws that value. The git branch and worktree are the one thing not in the payload, so
dashline asks `git` once. A command item runs under a 2-second timeout, so a slow tool
can't stall the line.

## Security

dashline can run shell commands, so it is deliberate about where they come from.

- Command items run only from your own user settings (`~/.claude/settings.json` and
  `~/.claude/settings.local.json`). Config that arrives through a project, such as a
  `.claude/settings.json` committed to a repository you cloned, may arrange widgets, but
  any command in it is dropped. Cloning a repo cannot make dashline run code.
- Dynamic values reach your commands through the environment (`$DASHLINE_BRANCH`,
  `$DASHLINE_WORKTREE`, `$DASHLINE_CWD`), never spliced into the command text, so a
  branch named like a shell expression cannot inject anything.
- dashline's own git lookups run without a shell.
- Each command runs under a 2-second timeout.
- A command's output is printed as is, including any terminal escapes it emits, so wire
  up only tools you trust.

## Develop

```bash
npm install
npm test          # node's test runner over src
npm run build     # bundle src to dist/dashline.js
npm run typecheck
```

Source is in `src/`: `widgets/` holds one file per field, `present/` draws each data
type, `render.ts` lays out the zones, `layout.ts` justifies a line, and `config.ts` reads
and merges settings. Adding a widget is one file plus one line in `widgets/registry.ts`.

## License

MIT © Ordinary Nerds. See [LICENSE](LICENSE).
