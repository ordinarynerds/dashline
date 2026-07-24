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

// src/widgets/branch.ts
var branch = {
  data({ git }) {
    if (!git.branch) return null;
    return { kind: "label", text: git.branch, icon: "\u2387", color: "cyan" };
  }
};

// src/widgets/model.ts
var model = {
  data({ payload: payload2 }) {
    const name2 = payload2.model?.display_name?.replace(/\s*\([^)]*\)\s*$/, "");
    if (!name2) return null;
    return { kind: "label", text: name2, color: "bold" };
  }
};

// src/widgets/context.ts
var context = {
  data(ctx2) {
    const c = ctx2.payload.context_window;
    const value = percent(ctx2);
    if (value === null) return { kind: "label", text: "--", color: "dim" };
    const used = c?.total_input_tokens ?? c?.current_usage?.input_tokens;
    const size = c?.context_window_size;
    return {
      kind: "percent",
      value,
      scale: "context",
      defaultBar: true,
      hint: true,
      tokens: used != null && size != null ? { used, size } : void 0
    };
  }
};
function percent(ctx2) {
  const c = ctx2.payload.context_window;
  if (!c) return null;
  if (typeof c.used_percentage === "number") return c.used_percentage;
  const used = c.total_input_tokens ?? c.current_usage?.input_tokens;
  if (used != null && c.context_window_size) return used / c.context_window_size * 100;
  return null;
}

// src/widgets/usage.ts
var session = {
  data({ payload: payload2 }) {
    const w = payload2.rate_limits?.five_hour;
    if (w?.used_percentage == null) return null;
    return { kind: "percent", value: w.used_percentage, scale: "usage", label: "session", reset: w.resets_at };
  }
};
var weekly = {
  data({ payload: payload2 }) {
    const w = payload2.rate_limits?.seven_day;
    if (w?.used_percentage == null) return null;
    return { kind: "percent", value: w.used_percentage, scale: "usage", label: "All" };
  }
};

// src/widgets/cost.ts
var cost = {
  data({ payload: payload2 }) {
    const usd = payload2.cost?.total_cost_usd;
    if (usd == null) return null;
    return { kind: "money", usd };
  }
};

// src/widgets/duration.ts
var duration = {
  data({ payload: payload2 }) {
    const ms = payload2.cost?.total_duration_ms;
    if (ms == null) return null;
    return { kind: "duration", ms };
  }
};

// src/widgets/lines.ts
var lines = {
  data({ payload: payload2 }) {
    const added = payload2.cost?.total_lines_added;
    const removed = payload2.cost?.total_lines_removed;
    if (added == null && removed == null) return null;
    return { kind: "delta", added: added ?? 0, removed: removed ?? 0 };
  }
};

// src/widgets/pr.ts
var pr = {
  data({ payload: payload2 }) {
    const n = payload2.pr?.number;
    if (n == null) return null;
    return { kind: "label", text: `PR #${n}`, color: "magenta" };
  }
};

// src/widgets/review.ts
var COLORS = {
  approved: "green",
  pending: "yellow",
  changes_requested: "red",
  draft: "dim"
};
var review = {
  data({ payload: payload2 }) {
    const state = payload2.pr?.review_state;
    if (!state) return null;
    return { kind: "label", text: state.replace(/_/g, " "), color: COLORS[state] ?? "dim" };
  }
};

// src/widgets/worktree.ts
var worktree = {
  data({ git }) {
    if (!git.worktree) return null;
    return { kind: "label", text: git.worktree, icon: "\u2302", iconColor: "yellow", color: "yellow" };
  }
};

// src/widgets/cwd.ts
import { homedir } from "node:os";
var cwd = {
  data({ payload: payload2 }) {
    const dir2 = payload2.workspace?.current_dir ?? payload2.cwd;
    if (!dir2) return null;
    const home = homedir();
    const text = home && dir2.startsWith(home) ? `~${dir2.slice(home.length)}` : dir2;
    return { kind: "label", text, color: "dim" };
  }
};

// src/widgets/repo.ts
var repo = {
  data({ payload: payload2 }, opts) {
    const r = payload2.workspace?.repo;
    if (!r?.name) return null;
    const text = opts.variant === "full" && r.owner ? `${r.owner}/${r.name}` : r.name;
    return { kind: "label", text, color: "dim" };
  }
};

// src/widgets/effort.ts
var effort = {
  data({ payload: payload2 }) {
    const level = payload2.effort?.level;
    if (!level) return null;
    return { kind: "label", text: level, color: "dim" };
  }
};

// src/widgets/name.ts
var name = {
  data({ payload: payload2 }) {
    const n = payload2.session_name;
    if (!n) return null;
    return { kind: "label", text: n, color: "dim" };
  }
};

// src/widgets/output.ts
var output = {
  data({ payload: payload2 }) {
    const s = payload2.output_style?.name;
    if (!s) return null;
    return { kind: "label", text: `/${s}`, color: "dim" };
  }
};

// src/widgets/version.ts
var version = {
  data({ payload: payload2 }) {
    if (!payload2.version) return null;
    return { kind: "label", text: `v${payload2.version}`, color: "dim" };
  }
};

// src/widgets/flags.ts
var fast = {
  data({ payload: payload2 }) {
    return { kind: "flag", on: Boolean(payload2.fast_mode), label: "fast" };
  }
};
var thinking = {
  data({ payload: payload2 }) {
    return { kind: "flag", on: Boolean(payload2.thinking?.enabled), label: "thinking" };
  }
};
var vim = {
  data({ payload: payload2 }) {
    const mode = payload2.vim?.mode;
    if (!mode) return null;
    return { kind: "label", text: mode, color: "dim" };
  }
};
var agent = {
  data({ payload: payload2 }) {
    const n = payload2.agent?.name;
    if (!n) return null;
    return { kind: "label", text: n, color: "magenta" };
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
  duration,
  lines,
  pr,
  review,
  worktree,
  cwd,
  repo,
  effort,
  name,
  output,
  version,
  fast,
  thinking,
  vim,
  agent
};
var widgetNames = new Set(Object.keys(registry));

// src/config.ts
var DEFAULTS = {
  separator: "\xB7",
  margin: 5,
  contextWarningAt: 40,
  contextCriticalAt: 50,
  usageWarningAt: 70,
  usageCriticalAt: 90
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
  let lines3 = merged.lines ?? DEFAULT_LINES;
  if (!linesTrusted) lines3 = lines3.map(withoutCommands);
  return { ...DEFAULTS, ...merged, lines: lines3 };
}
function withoutCommands(line) {
  if (Array.isArray(line)) return line.filter(keep);
  const zones = {};
  if (line.left) zones.left = line.left.filter(keep);
  if (line.center) zones.center = line.center.filter(keep);
  if (line.right) zones.right = line.right.filter(keep);
  return zones;
}
function keep(item) {
  if (typeof item === "string") return widgetNames.has(item);
  if (Array.isArray(item)) return widgetNames.has(item[0]);
  return true;
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
import { basename } from "node:path";
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
    if (top) worktree2 = basename(top);
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

// src/util/format.ts
function human(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}k`;
  return `${Math.round(n)}`;
}
function duration2(ms) {
  const s = Math.floor(ms / 1e3);
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
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

// src/present/percent.ts
var DEFAULT_WIDTH = 10;
function percent2(d, opts, ctx2) {
  const color = opts.color ?? fillColor(d, opts, ctx2);
  const width = opts.width ?? DEFAULT_WIDTH;
  const number = paint(`${Math.round(d.value)}%`, `bold ${color}`);
  const meter = paint(bar(d.value, width, opts.bar), color);
  switch (opts.variant) {
    case "pct":
      return number;
    case "bar":
      return meter;
    case "gauge":
      return paint(`\u2595${bar(d.value, width, opts.bar)}\u258F`, color);
    case "ratio":
      return d.tokens ? paint(`${human(d.tokens.used)}/${human(d.tokens.size)}`, color) : number;
    case "tokens":
      return d.tokens ? paint(`(${human(d.tokens.used)}/${human(d.tokens.size)})`, "dim") : number;
  }
  const label2 = opts.label ?? d.label;
  const parts = [];
  if (label2) parts.push(paint(label2, "dim"));
  parts.push(number);
  if (d.defaultBar || opts.bar) parts.push(meter);
  if (d.tokens)
    parts.push(
      paint(`(${human(d.tokens.used)}/${human(d.tokens.size)})`, "dim")
    );
  if (d.hint && d.value >= ctx2.thresholds.critical) {
    parts.push(
      `${paint("\u2192 /compact", "bold red")} ${paint("[focus instructions]", "dim")}`
    );
  } else if (d.hint && d.value >= ctx2.thresholds.warning) {
    parts.push(paint("\xB7 high", "yellow"));
  }
  if (d.reset && opts.countdown !== false)
    parts.push(paint(`(\u21BB${countdown(d.reset, ctx2.now)})`, "dim"));
  return parts.join(" ");
}
function fillColor(d, opts, ctx2) {
  const t = ctx2.thresholds;
  const warning = opts.warningAt ?? (d.scale === "context" ? t.warning : t.usageWarning);
  const critical = opts.criticalAt ?? (d.scale === "context" ? t.critical : t.usageCritical);
  return d.value >= critical ? "red" : d.value >= warning ? "yellow" : "green";
}

// src/present/scalars.ts
function duration3(d, opts) {
  const color = opts.color ?? "dim";
  const s = Math.floor(d.ms / 1e3);
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  if (opts.variant === "long") return paint(`${h}h${String(m).padStart(2, "0")}m`, color);
  if (opts.variant === "clock") {
    return paint(`${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`, color);
  }
  return paint(duration2(d.ms), color);
}
function money(d, opts) {
  const color = opts.color ?? "green";
  if (opts.variant === "cents") return paint(`${Math.round(d.usd * 100)}c`, color);
  if (opts.variant === "round") return paint(`$${Math.round(d.usd)}`, color);
  return paint(`$${d.usd.toFixed(2)}`, color);
}
function delta(d, opts) {
  if (opts.variant === "added") return paint(`+${d.added}`, opts.color ?? "green");
  if (opts.variant === "sum") {
    const net = d.added - d.removed;
    return paint(`${net >= 0 ? "+" : ""}${net}`, opts.color ?? (net >= 0 ? "green" : "red"));
  }
  if (opts.color) return paint(`+${d.added} -${d.removed}`, opts.color);
  return `${paint(`+${d.added}`, "green")} ${paint(`-${d.removed}`, "red")}`;
}
function flag(d, opts) {
  if (opts.variant === "onoff") return paint(`${d.label}:${d.on ? "on" : "off"}`, opts.color ?? (d.on ? "green" : "dim"));
  return d.on ? paint(d.label, opts.color ?? "yellow") : null;
}

// src/present/label.ts
import { basename as basename2 } from "node:path";
function label(d, opts) {
  let text = d.text;
  const v = opts.variant;
  if (v === "basename") text = basename2(text);
  else if (v === "upper") text = text.toUpperCase();
  else if (v === "lower") text = text.toLowerCase();
  const limit = opts.truncate ?? (v?.startsWith("truncate:") ? Number(v.slice("truncate:".length)) : 0);
  if (limit > 0 && text.length > limit) text = `${text.slice(0, limit - 1)}\u2026`;
  const color = opts.color ?? d.color;
  const body = color ? paint(text, color) : text;
  const icon = opts.icon ?? d.icon;
  return icon ? `${paint(icon, d.iconColor ?? "dim")} ${body}` : body;
}

// src/present/index.ts
function present(datum, opts, ctx2) {
  switch (datum.kind) {
    case "percent":
      return percent2(datum, opts, ctx2);
    case "duration":
      return duration3(datum, opts);
    case "money":
      return money(datum, opts);
    case "delta":
      return delta(datum, opts);
    case "label":
      return label(datum, opts);
    case "flag":
      return flag(datum, opts);
  }
}

// src/util/width.ts
var ANSI = /\x1b\[[0-9;]*m/g;
function visibleWidth(text) {
  return [...text.replace(ANSI, "")].length;
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
  if (typeof item === "object" && !Array.isArray(item)) {
    if (!item.text) return null;
    return item.color ? paint(item.text, item.color) : item.text;
  }
  const [id, raw2] = Array.isArray(item) ? item : [item, void 0];
  const opts = typeof raw2 === "string" ? isStyle(raw2) ? { color: raw2 } : { variant: raw2 } : raw2 ?? {};
  const widget = registry[id];
  if (!widget) return runCommand(id, ctx2);
  const datum = widget.data(ctx2, opts);
  if (!datum) return null;
  const out = present(datum, opts, ctx2);
  return out == null || out === "" ? null : out;
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
    warning: config.contextWarningAt,
    critical: config.contextCriticalAt,
    usageWarning: config.usageWarningAt,
    usageCritical: config.usageCriticalAt
  },
  now: Math.floor(Date.now() / 1e3)
};
var columns = Number(process.env.COLUMNS) || 80;
var lines2 = render(config, ctx, columns);
if (lines2.length > 0) process.stdout.write(`${lines2.join("\n")}
`);
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}
