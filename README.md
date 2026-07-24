# dashline

A configurable Claude Code status line. You compose it in `settings.json` by
listing the fields you want and where they go. No scripting, no bash. It ships with
a sensible default (context window on the left, subscription usage on the right), so
it looks right the moment you install it.

![Dashline in a Claude Code terminal across its ok, high, and compact states](assets/dashline.png)

<p align="center">
  <a href="https://x.com/_ordinarynerds"><img src="https://img.shields.io/badge/Follow%20us%20on%20X-%40__ordinarynerds-000000?style=for-the-badge&logo=x&logoColor=white" alt="Follow @_ordinarynerds on X"></a>
</p>

## Why

If you want something simpler than a full status-line builder, this is it. Two
things go wrong in a long Claude Code session: the context window fills up until the
model starts dropping detail, and you hit a rate limit you never saw coming. dashline
puts both in front of you, and lets you add anything else the payload knows about by
naming it in your settings.

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

The installer backs up `settings.json`, points `statusLine` at
`node dist/dashline.js`, and leaves a `settings.json.bak-dashline-*` file. Undo with
`./scripts/install.sh --uninstall`. Start a new session or run `/statusline` to see it.

**Requirements:** Node 18 or newer. That is the only dependency.

## Configure

Everything lives under a `dashline` key in `~/.claude/settings.json` (project
`.claude/settings.json` and `settings.local.json` override it). This is the default,
and writing it out reproduces what ships:

```jsonc
{
  "dashline": {
    "lines": [
      { "left": ["branch", "model", "context"], "right": ["session", "weekly"] }
    ]
  }
}
```

`lines` is a list, and each entry is one row on screen.

**A row** is either a bare array, which is left-aligned:

```jsonc
["branch", "model", "context"]
```

or an object with up to three zones that dashline spreads across the width:

```jsonc
{ "left": ["branch"], "center": ["cwd"], "right": ["cost", "pr"] }
```

**An item** in a zone is one of:

| Form | Meaning |
|---|---|
| `"branch"` | a widget, in its default style |
| `["model", "red"]` | a widget, recolored (see [styles](#styles)) |
| `["context", "bar"]` | a widget, in a named variant (see [widgets](#widgets)) |
| `["context", { "variant": "bar", "color": "yellow" }]` | variant and color together |
| `"codemap ls --linked"` | anything unrecognized runs as a shell command; its first line of output is shown |

A string is read as a color when it is a known style term, otherwise as a variant, so
`["model", "red"]` and `["context", "pct"]` both do what they look like.

### Other keys

| Key | Default | Effect |
|---|---|---|
| `separator` | `·` | drawn dim between items in a zone |
| `margin` | `5` | columns kept free at the right edge |
| `warn` | `40` | context turns yellow ("high") at/above this % |
| `compact` | `50` | context turns red with `→ /compact` at/above this % |
| `usageWarn` | `70` | usage widgets turn yellow at/above this % |
| `usageCrit` | `90` | usage widgets turn red at/above this % |

## Widgets

Each widget reads one part of the JSON payload Claude Code sends on stdin, and every
one is choosable by name. A widget with no data removes itself, and a row left with
nothing on it is skipped.

Every item can take a **color** (see [Styles](#styles)). Some also take a **variant**
(a different way to show the same data). The one string after the name is read as a
color if it is a known color word, otherwise as a variant, and the object form sets
either or both:

```jsonc
"branch"                                  // default
["model", "cyan"]                         // color
["cwd", "basename"]                       // variant
["context", { "variant": "bar", "bar": "fine", "color": "yellow" }]
```

| Widget | Example | Displays | Payload field | Variants |
|---|---|---|---|---|
| `branch` | `⎇ main` | git branch | git | |
| `model` | `Opus 4.8` | model name | `model.display_name` | |
| `context` | `44% ████░░░░░░ (440k/1.0M) · high` | how full the window is | `context_window` | `full`, `bar`, `pct`, `tokens` + [bar styles](#bar-styles) |
| `session` | `session 61% (↻2h11m)` | 5-hour usage and reset | `rate_limits.five_hour` | |
| `weekly` | `All 74%` | 7-day usage | `rate_limits.seven_day` | |
| `cost` | `$2.69` | session cost in USD | `cost.total_cost_usd` | |
| `duration` | `37m` | wall-clock this session | `cost.total_duration_ms` | |
| `lines` | `+156 -23` | lines added and removed | `cost.total_lines_added` / `_removed` | |
| `pr` | `PR #702` | open PR number | `pr.number` | |
| `review` | `pending` | PR review state | `pr.review_state` | |
| `worktree` | `⌂ hotfix` | linked worktree | `workspace.git_worktree` | |
| `cwd` | `~/Development/dashline` | working directory | `workspace.current_dir` | `full`, `basename` |
| `repo` | `dashline` | repository name | `workspace.repo` | `full` (owner/name) |
| `effort` | `high` | reasoning effort | `effort.level` | |
| `name` | `celestial-vega` | session name | `session_name` | |
| `output` | `/default` | output style | `output_style.name` | |
| `version` | `v2.1.90` | Claude Code version | `version` | |
| `fast` | `fast` | shown when fast mode is on | `fast_mode` | |
| `thinking` | `thinking` | shown when thinking is on | `thinking.enabled` | |
| `vim` | `NORMAL` | vim mode | `vim.mode` | |
| `agent` | `security-reviewer` | active subagent | `agent.name` | |

`context`, `session`, and `weekly` color themselves by fill (green to red). The usage
pair appears on Pro and Max accounts once the payload starts carrying rate limits.
Anything not in this list is treated as a shell command (see [Examples](#examples)).

## Styles

A style term is one or more of these words, so `"bold red"` is valid:

`red` · `green` · `yellow` · `blue` · `magenta` · `cyan` · `gray` · `dim` · `bold`

Recoloring an item replaces its whole look with that color. The color-by-fill widgets
(`context`, `session`, `weekly`) lose their meaning when you recolor them, so leave
those alone unless you want a fixed color.

### Bar styles

The `context` bar is drawn with blocks by default. Pick another with a `bar` option:

```jsonc
["context", { "bar": "fine" }]
["context", { "variant": "bar", "bar": "line" }]
```

| `bar` | 44% of 10 | |
|---|---|---|
| `blocks` (default) | `████░░░░░░` | sharp |
| `shade` | `▓▓▓▓░░░░░░` | softer fill |
| `line` | `━━━━──────` | thin |
| `ascii` | `[###-----]` | brackets counted inside the width |
| `fine` | `████▍░░░░░` | smooth, 8 sub-cell steps per column |

Every style uses single-cell glyphs, so the bar stays the same width whichever you pick.

## Examples

Two lines, a custom left/right split, and a plain directory row:

```jsonc
{
  "dashline": {
    "lines": [
      { "left": ["model", "name"], "right": ["output"] },
      { "left": ["branch", ["context", "pct"]], "right": ["cost", "pr"] },
      ["cwd"]
    ]
  }
}
```

Fold in your own tools as command rows. Each command is given the same JSON on stdin,
plus `DASHLINE_BRANCH`, `DASHLINE_WORKTREE`, and `DASHLINE_CWD` in its environment:

```jsonc
{
  "dashline": {
    "lines": [
      { "left": ["branch", "context"], "right": ["session", "weekly"] },
      ["codemap ls --linked"],
      ["kache stat --branch \"$DASHLINE_BRANCH\""]
    ]
  }
}
```

## How it works

Claude Code hands the status-line command a JSON payload on stdin. dashline reads it,
reads your `dashline` config from the settings files, and prints one line per entry in
`lines`. No network, no transcript parsing, nothing that drifts between releases.

Each widget is a small pure function from the payload to a string. The git branch and
worktree are the one thing not in the payload, so dashline asks `git` once. A command
item runs in a 2-second timeout, so a slow tool can't stall the line.

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

Source is in `src/`: `widgets/` holds one file per field, `render.ts` lays out the
zones, `layout.ts` justifies a line, `config.ts` reads and merges settings. Adding a
widget is one file plus one line in `widgets/registry.ts`.

## License

MIT © Ordinary Nerds. See [LICENSE](LICENSE).
