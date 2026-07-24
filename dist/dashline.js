#!/usr/bin/env node

// src/payload.ts
function parsePayload(raw2) {
  try {
    return JSON.parse(raw2);
  } catch {
    return {};
  }
}

// src/config.ts
import { readFileSync } from "node:fs";
import { homedir as homedir2 } from "node:os";
import { join } from "node:path";

// src/style.ts
var CODES = {
  reset: "0",
  bold: "1",
  dim: "2",
  red: "1;31",
  green: "32",
  yellow: "33",
  blue: "34",
  magenta: "35",
  cyan: "36",
  gray: "90"
};
var RESET = "\x1B[0m";
function paint(text, term) {
  if (!term || !text) return text;
  const codes = term.split(/\s+/).map((word) => CODES[word]).filter(Boolean);
  if (codes.length === 0) return text;
  return `\x1B[${codes.join(";")}m${text}${RESET}`;
}
function isStyle(term) {
  return term.split(/\s+/).every((word) => word in CODES);
}

// src/widgets/branch.ts
var branch = {
  render({ git }) {
    if (!git.branch) return null;
    return `${paint("\u2387", "dim")} ${paint(git.branch, "cyan")}`;
  }
};

// src/widgets/model.ts
var model = {
  render({ payload: payload2 }) {
    const name2 = payload2.model?.display_name?.replace(/\s*\([^)]*\)\s*$/, "");
    if (!name2) return null;
    return paint(name2, "bold");
  }
};

// src/util/format.ts
function human(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return `${Math.round(n)}`;
}
function countdown(resetsAt, now) {
  const d = Math.max(0, resetsAt - now);
  const days = Math.floor(d / 86400);
  const hrs = Math.floor(d % 86400 / 3600);
  const mins = Math.floor(d % 3600 / 60);
  if (days > 0) return `${days}d${hrs}h`;
  if (hrs > 0) return `${hrs}h${String(mins).padStart(2, "0")}m`;
  return `${mins}m`;
}

// src/util/bar.ts
var SETS = {
  blocks: { full: "\u2588", empty: "\u2591" },
  shade: { full: "\u2593", empty: "\u2591" },
  line: { full: "\u2501", empty: "\u2500" },
  ascii: { full: "#", empty: "-", wrap: ["[", "]"] }
};
var EIGHTHS = ["", "\u258F", "\u258E", "\u258D", "\u258C", "\u258B", "\u258A", "\u2589"];
function bar(pct, width, style = "blocks") {
  const ratio = Math.min(100, Math.max(0, pct)) / 100;
  if (style === "fine") return fine(ratio, width);
  const set = SETS[style] ?? SETS.blocks;
  const inner = set.wrap ? Math.max(0, width - 2) : width;
  const fill = Math.round(ratio * inner);
  const body = set.full.repeat(fill) + set.empty.repeat(inner - fill);
  return set.wrap ? set.wrap[0] + body + set.wrap[1] : body;
}
function fine(ratio, width) {
  const cells = ratio * width;
  const full = Math.floor(cells);
  const part = Math.round((cells - full) * 8);
  let out = "\u2588".repeat(full);
  let empty = width - full;
  if (part > 0 && full < width) {
    out += EIGHTHS[part];
    empty -= 1;
  }
  return out + "\u2591".repeat(Math.max(0, empty));
}
var barStyles = [...Object.keys(SETS), "fine"];

// src/widgets/context.ts
var WIDTH = 10;
var context = {
  render(ctx2, opts) {
    const c = ctx2.payload.context_window;
    const pct = percent(ctx2);
    if (pct === null) return paint("--", "dim");
    const color = pct >= ctx2.thresholds.compact ? "red" : pct >= ctx2.thresholds.warn ? "yellow" : "green";
    const variant = opts.variant ?? "full";
    const number = paint(`${pct}%`, `bold ${color}`);
    const bar2 = paint(bar(pct, WIDTH, opts.bar), color);
    const tokens = tokenLabel(c);
    if (variant === "pct") return number;
    if (variant === "bar") return bar2;
    if (variant === "tokens") return tokens ?? number;
    let hint = "";
    if (pct >= ctx2.thresholds.compact) hint = ` ${paint("\u2192 /compact", "bold red")} ${paint("[next goal/task]", "dim")}`;
    else if (pct >= ctx2.thresholds.warn) hint = ` ${paint("\xB7 high", "yellow")}`;
    return `${number} ${bar2}${tokens ? ` ${tokens}` : ""}${hint}`;
  }
};
function tokenLabel(c) {
  const used = c?.total_input_tokens ?? c?.current_usage?.input_tokens;
  const size = c?.context_window_size;
  if (used == null || size == null) return null;
  return paint(`(${human(used)}/${human(size)})`, "dim");
}
function percent(ctx2) {
  const c = ctx2.payload.context_window;
  if (!c) return null;
  if (typeof c.used_percentage === "number") return Math.round(c.used_percentage);
  const used = c.total_input_tokens ?? c.current_usage?.input_tokens;
  if (used != null && c.context_window_size) return Math.round(used / c.context_window_size * 100);
  return null;
}

// src/widgets/usage.ts
function usageColor(pct, { usageWarn, usageCrit }) {
  if (pct >= usageCrit) return "red";
  if (pct >= usageWarn) return "yellow";
  return "green";
}
var session = {
  render(ctx2) {
    const w = ctx2.payload.rate_limits?.five_hour;
    if (w?.used_percentage == null) return null;
    const pct = Math.round(w.used_percentage);
    let out = `${paint("session", "dim")} ${paint(`${pct}%`, usageColor(pct, ctx2.thresholds))}`;
    if (w.resets_at) out += ` ${paint(`(\u21BB${countdown(w.resets_at, ctx2.now)})`, "dim")}`;
    return out;
  }
};
var weekly = {
  render(ctx2) {
    const w = ctx2.payload.rate_limits?.seven_day;
    if (w?.used_percentage == null) return null;
    const pct = Math.round(w.used_percentage);
    return `${paint("All", "dim")} ${paint(`${pct}%`, usageColor(pct, ctx2.thresholds))}`;
  }
};

// src/widgets/cost.ts
var cost = {
  render({ payload: payload2 }) {
    const usd = payload2.cost?.total_cost_usd;
    if (usd == null) return null;
    return paint(`$${usd.toFixed(2)}`, "green");
  }
};

// src/widgets/pr.ts
var pr = {
  render({ payload: payload2 }) {
    const n = payload2.pr?.number;
    if (n == null) return null;
    return paint(`PR #${n}`, "magenta");
  }
};

// src/widgets/worktree.ts
var worktree = {
  render({ git }) {
    if (!git.worktree) return null;
    return `${paint("\u2302", "yellow")} ${paint(git.worktree, "yellow")}`;
  }
};

// src/widgets/cwd.ts
import { homedir } from "node:os";
import { basename } from "node:path";
var cwd = {
  render({ payload: payload2 }, opts) {
    const dir2 = payload2.workspace?.current_dir ?? payload2.cwd;
    if (!dir2) return null;
    if (opts.variant === "basename") return paint(basename(dir2), "dim");
    const home = homedir();
    const shown = home && dir2.startsWith(home) ? `~${dir2.slice(home.length)}` : dir2;
    return paint(shown, "dim");
  }
};

// src/widgets/effort.ts
var effort = {
  render({ payload: payload2 }) {
    const level = payload2.effort?.level;
    if (!level) return null;
    return paint(level, "dim");
  }
};

// src/widgets/name.ts
var name = {
  render({ payload: payload2 }) {
    const n = payload2.session_name;
    if (!n) return null;
    return paint(n, "dim");
  }
};

// src/widgets/output.ts
var output = {
  render({ payload: payload2 }) {
    const s = payload2.output_style?.name;
    if (!s) return null;
    return paint(`/${s}`, "dim");
  }
};

// src/widgets/registry.ts
var registry = {
  branch,
  model,
  context,
  session,
  weekly,
  cost,
  pr,
  worktree,
  cwd,
  effort,
  name,
  output
};
var widgetNames = new Set(Object.keys(registry));

// src/config.ts
var DEFAULTS = {
  separator: "\xB7",
  margin: 5,
  warn: 40,
  compact: 50,
  usageWarn: 70,
  usageCrit: 90
};
var DEFAULT_LINES = [
  { left: ["branch", "model", "context"], right: ["session", "weekly"] }
];
function loadConfig(payload2) {
  const project = payload2.workspace?.project_dir ?? payload2.workspace?.current_dir ?? payload2.cwd;
  const home = join(homedir2(), ".claude");
  const trusted = /* @__PURE__ */ new Set([join(home, "settings.json"), join(home, "settings.local.json")]);
  const candidates = [
    join(home, "settings.json"),
    join(home, "settings.local.json"),
    project && join(project, ".claude", "settings.json"),
    project && join(project, ".claude", "settings.local.json")
  ].filter((f) => typeof f === "string");
  let merged = {};
  let linesTrusted = true;
  const seen = /* @__PURE__ */ new Set();
  for (const file of candidates) {
    if (seen.has(file)) continue;
    seen.add(file);
    const found = read(file);
    if (found.lines !== void 0) linesTrusted = trusted.has(file);
    merged = Object.assign(merged, found);
  }
  let lines2 = merged.lines ?? DEFAULT_LINES;
  if (!linesTrusted) lines2 = lines2.map(withoutCommands);
  return { ...DEFAULTS, ...merged, lines: lines2 };
}
function withoutCommands(line) {
  if (Array.isArray(line)) return line.filter(isWidget);
  const zones = {};
  if (line.left) zones.left = line.left.filter(isWidget);
  if (line.center) zones.center = line.center.filter(isWidget);
  if (line.right) zones.right = line.right.filter(isWidget);
  return zones;
}
function isWidget(item) {
  return widgetNames.has(Array.isArray(item) ? item[0] : item);
}
function read(file) {
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    return parsed.dashline && typeof parsed.dashline === "object" ? parsed.dashline : {};
  } catch {
    return {};
  }
}

// src/util/git.ts
import { execFileSync } from "node:child_process";
import { basename as basename2 } from "node:path";
function readGit(dir2, worktreeHint) {
  if (!dir2) return {};
  const out = run(dir2, ["rev-parse", "--abbrev-ref", "HEAD", "--absolute-git-dir"]);
  if (!out) return {};
  const [head, gitDir] = out.split("\n");
  let branch2 = head;
  if (branch2 === "HEAD") {
    branch2 = run(dir2, ["rev-parse", "--short", "HEAD"]) ?? "HEAD";
  }
  let worktree2 = worktreeHint;
  if (!worktree2 && gitDir?.includes("/worktrees/")) {
    const top = run(dir2, ["rev-parse", "--show-toplevel"]);
    if (top) worktree2 = basename2(top);
  }
  return { branch: branch2 || void 0, worktree: worktree2 };
}
function run(dir2, args) {
  try {
    return execFileSync("git", ["-C", dir2, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return void 0;
  }
}

// src/widgets/command.ts
import { execSync } from "node:child_process";
function runCommand(cmd, ctx2) {
  try {
    const out = execSync(cmd, {
      encoding: "utf8",
      timeout: 2e3,
      input: JSON.stringify(ctx2.payload),
      stdio: ["pipe", "pipe", "ignore"],
      env: { ...process.env, ...exported(ctx2) }
    });
    const line = out.split("\n").find((l) => l.trim().length > 0);
    return line ? line.replace(/\s+$/, "") : null;
  } catch {
    return null;
  }
}
function exported(ctx2) {
  return {
    DASHLINE_BRANCH: ctx2.git.branch ?? "",
    DASHLINE_WORKTREE: ctx2.git.worktree ?? "",
    DASHLINE_CWD: ctx2.payload.workspace?.current_dir ?? ctx2.payload.cwd ?? ""
  };
}

// src/util/width.ts
var ANSI = /\x1b\[[0-9;]*m/g;
function visibleWidth(text) {
  return [...text.replace(ANSI, "")].length;
}
function strip(text) {
  return text.replace(ANSI, "");
}

// src/layout.ts
function compose(left, center, right, columns2, margin) {
  if (!center && !right) return left;
  const target = columns2 - margin;
  const lw = visibleWidth(left);
  const cw = visibleWidth(center);
  const rw = visibleWidth(right);
  if (!center) {
    const gap = target - lw - rw;
    return gap < 3 ? `${left}   ${right}` : left + " ".repeat(gap) + right;
  }
  const free = target - lw - cw - rw;
  if (free < 4) return [left, center, right].filter(Boolean).join("   ");
  let gapLeft = Math.floor((target - cw) / 2) - lw;
  let gapRight = target - rw - (Math.floor((target - cw) / 2) + cw);
  if (gapLeft < 1 || gapRight < 1) {
    gapLeft = Math.floor(free / 2);
    gapRight = free - gapLeft;
  }
  return left + " ".repeat(gapLeft) + center + " ".repeat(gapRight) + right;
}

// src/render.ts
function render(config2, ctx2, columns2) {
  const sep = ` ${paint(config2.separator, "dim")} `;
  const out = [];
  for (const line of config2.lines) {
    const rendered = renderLine(line, ctx2, config2, columns2, sep);
    if (rendered !== null) out.push(rendered);
  }
  return out;
}
function renderLine(line, ctx2, config2, columns2, sep) {
  const zones = Array.isArray(line) ? { left: line } : line;
  const left = renderZone(zones.left, ctx2, sep);
  const center = renderZone(zones.center, ctx2, sep);
  const right = renderZone(zones.right, ctx2, sep);
  if (!left && !center && !right) return null;
  return compose(left, center, right, columns2, config2.margin);
}
function renderZone(items, ctx2, sep) {
  if (!items) return "";
  const parts = [];
  for (const item of items) {
    const rendered = renderItem(item, ctx2);
    if (rendered) parts.push(rendered);
  }
  return parts.join(sep);
}
function renderItem(item, ctx2) {
  const [id, raw2] = Array.isArray(item) ? item : [item, void 0];
  const opts = typeof raw2 === "string" ? isStyle(raw2) ? { color: raw2 } : { variant: raw2 } : raw2 ?? {};
  const widget = registry[id];
  const out = widget ? widget.render(ctx2, opts) : runCommand(id, ctx2);
  if (out == null || out === "") return null;
  return opts.color ? paint(strip(out), opts.color) : out;
}

// src/index.ts
var raw = await readStdin();
var payload = parsePayload(raw);
var config = loadConfig(payload);
var dir = payload.workspace?.current_dir ?? payload.cwd;
var ctx = {
  payload,
  git: readGit(dir, payload.workspace?.git_worktree),
  thresholds: {
    warn: config.warn,
    compact: config.compact,
    usageWarn: config.usageWarn,
    usageCrit: config.usageCrit
  },
  now: Math.floor(Date.now() / 1e3)
};
var columns = Number(process.env.COLUMNS) || 80;
var lines = render(config, ctx, columns);
if (lines.length > 0) process.stdout.write(`${lines.join("\n")}
`);
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}
