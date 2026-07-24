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
    const value = contextPercent(ctx2.payload);
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
function contextPercent(payload2) {
  const c = payload2.context_window;
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
  data({ payload: payload2 }, opts) {
    const n = payload2.session_name;
    if (!n) return null;
    const text = opts.id && payload2.session_id ? `${n}-${payload2.session_id.slice(0, 8)}` : n;
    return { kind: "label", text, color: "dim" };
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

// src/util/format.ts
var TICKS = ["\u2581", "\u2582", "\u2583", "\u2584", "\u2585", "\u2586", "\u2587", "\u2588"];
function spark(values) {
  return values.map((v) => TICKS[Math.min(7, Math.max(0, Math.round(v / 100 * 7)))]).join("");
}
function human(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) {
    const k = Math.round(n / 1e3);
    return k >= 1e3 ? `${(n / 1e6).toFixed(1)}M` : `${k}k`;
  }
  return `${Math.round(n)}`;
}
function hms(ms) {
  const total = Math.floor(ms / 1e3);
  return { h: Math.floor(total / 3600), m: Math.floor(total % 3600 / 60), s: total % 60 };
}
function duration2(ms) {
  const { h, m, s } = hms(ms);
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}
function countdown(resetsAt, now2) {
  const d = Math.max(0, resetsAt - now2);
  const days = Math.floor(d / 86400);
  const hrs = Math.floor(d % 86400 / 3600);
  const mins = Math.floor(d % 3600 / 60);
  if (days > 0) return `${days}d${hrs}h`;
  if (hrs > 0) return `${hrs}h${String(mins).padStart(2, "0")}m`;
  return `${mins}m`;
}

// src/widgets/sparkline.ts
var sparkline = {
  data(ctx2) {
    const values = (ctx2.history ?? []).filter((s) => s.ctx != null).map((s) => s.ctx);
    if (values.length < 2) return null;
    const recent = values.slice(-20);
    const last = recent[recent.length - 1];
    const t = ctx2.thresholds;
    const color = last >= t.critical ? "red" : last >= t.warning ? "yellow" : "green";
    return { kind: "label", text: spark(recent), color };
  }
};

// src/widgets/burn.ts
var MAX_ETA = 6 * 3600;
var burn = {
  data(ctx2) {
    const pts = (ctx2.history ?? []).filter((s) => s.ctx != null).map((s) => ({ t: s.t, v: s.ctx }));
    if (pts.length < 3) return null;
    const slope = slopeOf(pts);
    if (slope <= 0) return null;
    const last = pts[pts.length - 1];
    const remaining = ctx2.thresholds.critical - last.v;
    if (remaining <= 0) return null;
    const seconds = remaining / slope;
    if (!Number.isFinite(seconds) || seconds > MAX_ETA) return null;
    return { kind: "label", text: `\u2192 /compact ~${duration2(seconds * 1e3)}`, color: "red" };
  }
};
function slopeOf(pts) {
  const n = pts.length;
  const t0 = pts[0].t;
  let sx = 0;
  let sy = 0;
  let sxy = 0;
  let sxx = 0;
  for (const p of pts) {
    const x = p.t - t0;
    sx += x;
    sy += p.v;
    sxy += x * p.v;
    sxx += x * x;
  }
  const denom = n * sxx - sx * sx;
  return denom === 0 ? 0 : (n * sxy - sx * sy) / denom;
}

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
  sparkline,
  burn,
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
  powerline: false,
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
  let lines2 = Array.isArray(merged.lines) ? merged.lines : DEFAULT_LINES;
  if (!linesTrusted) lines2 = lines2.map(withoutCommands);
  return { ...DEFAULTS, ...merged, lines: lines2 };
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
  let raw2;
  try {
    raw2 = readFileSync(file, "utf8");
  } catch {
    return {};
  }
  try {
    const parsed = JSON.parse(raw2);
    return parsed.dashline && typeof parsed.dashline === "object" ? parsed.dashline : {};
  } catch {
    process.stderr.write(`dashline: ignoring ${file} (invalid JSON)
`);
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

// src/scan.ts
var GIT_WIDGETS = /* @__PURE__ */ new Set(["branch", "worktree"]);
var HISTORY_WIDGETS = /* @__PURE__ */ new Set(["sparkline", "burn"]);
function scan(lines2) {
  const commands2 = /* @__PURE__ */ new Set();
  let usesGit2 = false;
  let usesHistory2 = false;
  for (const line of lines2) {
    const zones = Array.isArray(line) ? { left: line } : line;
    for (const items of [zones.left, zones.center, zones.right]) {
      if (!items) continue;
      for (const item of items) {
        const id = itemId(item);
        if (id === null) continue;
        if (widgetNames.has(id)) {
          if (GIT_WIDGETS.has(id)) usesGit2 = true;
          if (HISTORY_WIDGETS.has(id)) usesHistory2 = true;
        } else {
          commands2.add(id);
          usesGit2 = true;
        }
      }
    }
  }
  return { commands: [...commands2], usesGit: usesGit2, usesHistory: usesHistory2 };
}
function itemId(item) {
  if (typeof item === "string") return item;
  if (Array.isArray(item)) return item[0];
  return null;
}

// src/state.ts
import { readFileSync as readFileSync2, writeFileSync, renameSync } from "node:fs";
import { homedir as homedir3 } from "node:os";
import { join as join2 } from "node:path";
var GAP = 5;
var KEEP = 60;
var MAX_SESSIONS = 20;
var SESSION_TTL = 6 * 3600;
function statePath() {
  const dir2 = process.env.CLAUDE_CONFIG_DIR ?? join2(homedir3(), ".claude");
  return join2(dir2, "dashline-state.json");
}
function sampleHistory(sessionId, ctx2, cost2, now2) {
  if (!sessionId) return [];
  const path = statePath();
  let store = {};
  try {
    const parsed = JSON.parse(readFileSync2(path, "utf8"));
    if (parsed && typeof parsed === "object") store = parsed;
  } catch {
  }
  const samples = Array.isArray(store[sessionId]) ? store[sessionId] : [];
  const last = samples[samples.length - 1];
  if (!last || now2 - last.t >= GAP) {
    samples.push({ t: now2, ctx: ctx2, cost: cost2 });
    if (samples.length > KEEP) samples.splice(0, samples.length - KEEP);
  }
  store[sessionId] = samples;
  prune(store, now2);
  try {
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, JSON.stringify(store));
    renameSync(tmp, path);
  } catch {
  }
  return samples;
}
function prune(store, now2) {
  for (const id of Object.keys(store)) {
    const s = store[id];
    const last = s[s.length - 1];
    if (!last || now2 - last.t > SESSION_TTL) delete store[id];
  }
  const ids = Object.keys(store);
  if (ids.length > MAX_SESSIONS) {
    ids.map((id) => [id, store[id][store[id].length - 1]?.t ?? 0]).sort((a, b) => a[1] - b[1]).slice(0, ids.length - MAX_SESSIONS).forEach(([id]) => delete store[id]);
  }
}

// src/widgets/command.ts
import { spawn } from "node:child_process";
var TIMEOUT_MS = 2e3;
function runCommand(cmd, ctx2) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(value);
    };
    const child = spawn(cmd, {
      shell: true,
      detached: true,
      env: { ...process.env, ...exported(ctx2) },
      stdio: ["pipe", "pipe", "ignore"]
    });
    const timer = setTimeout(() => {
      if (child.pid) {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
        }
      }
      finish(null);
    }, TIMEOUT_MS);
    let out = "";
    child.stdout.on("data", (chunk) => {
      out += chunk;
    });
    child.on("error", () => finish(null));
    child.on("close", () => {
      const line = out.split("\n").find((l) => l.trim().length > 0);
      finish(line ? line.replace(/\s+$/, "") : null);
    });
    child.stdin.on("error", () => {
    });
    child.stdin.end(JSON.stringify(ctx2.payload));
  });
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
  black: "30",
  red: "31",
  green: "32",
  yellow: "33",
  blue: "34",
  magenta: "35",
  cyan: "36",
  white: "37",
  gray: "90"
};
var RESET = "\x1B[0m";
var CONTROL = /[\x00-\x1f\x7f]/g;
function paint(text, term, bg) {
  if (!text || !term && !bg) return text;
  const codes = [];
  if (term) codes.push(...term.split(/\s+/).map(codesFor).filter((c) => c !== null));
  if (bg) {
    const b = bgCode(bg);
    if (b) codes.push(b);
  }
  if (codes.length === 0) return text;
  return `\x1B[${codes.join(";")}m${text}${RESET}`;
}
function bgCode(word) {
  const rgb = hex(word);
  if (rgb) return `48;2;${rgb[0]};${rgb[1]};${rgb[2]}`;
  const fg = CODES[word];
  return fg && /^(3\d|9\d)$/.test(fg) ? String(Number(fg) + 10) : null;
}
function bgToFg(bg) {
  if (bg.startsWith("48;2;")) return `38;2;${bg.slice(5)}`;
  const n = Number(bg);
  return Number.isFinite(n) ? String(n - 10) : bg;
}
function fill(text, bg) {
  const open = `\x1B[${bg}m`;
  return open + text.split(RESET).join(`${RESET}${open}`) + RESET;
}
function isStyle(term) {
  return term.split(/\s+/).every((word) => codesFor(word) !== null);
}
function codesFor(word) {
  if (word in CODES) return CODES[word];
  const rgb = hex(word);
  return rgb ? `38;2;${rgb[0]};${rgb[1]};${rgb[2]}` : null;
}
function hex(word) {
  if (!word.startsWith("#")) return null;
  let h = word.slice(1);
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function sanitize(text) {
  return text.replace(CONTROL, "");
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
  const fill2 = Math.round(ratio * inner);
  const body = set.full.repeat(fill2) + set.empty.repeat(inner - fill2);
  return set.wrap ? set.wrap[0] + body + set.wrap[1] : body;
}
function fine(ratio, width) {
  const eighths = Math.round(ratio * width * 8);
  const full = Math.floor(eighths / 8);
  const part = eighths % 8;
  const partial = part > 0 && full < width ? EIGHTHS[part] : "";
  const empty = width - full - (partial ? 1 : 0);
  return "\u2588".repeat(Math.min(full, width)) + partial + "\u2591".repeat(Math.max(0, empty));
}
var barStyles = [...Object.keys(SETS), "fine"];

// src/present/percent.ts
var DEFAULT_WIDTH = 10;
function percent(d, opts, ctx2) {
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
      return d.tokens ? paint(tokens(d), "dim") : number;
  }
  const label2 = opts.label ?? d.label;
  const parts = [];
  if (label2) parts.push(paint(label2, "dim"));
  parts.push(number);
  if (d.defaultBar || opts.bar) parts.push(meter);
  if (d.tokens) parts.push(paint(tokens(d), "dim"));
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
function tokens(d) {
  return `(${human(d.tokens.used)}/${human(d.tokens.size)})`;
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
  const { h, m, s } = hms(d.ms);
  if (opts.variant === "long") return paint(`${h}h${String(m).padStart(2, "0")}m`, color);
  if (opts.variant === "clock") {
    return paint(`${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`, color);
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
  const body = color || opts.bg ? paint(text, color, opts.bg) : text;
  const icon = opts.icon ?? d.icon;
  return icon ? `${paint(icon, d.iconColor ?? "dim")} ${body}` : body;
}

// src/present/index.ts
function present(datum, opts, ctx2) {
  switch (datum.kind) {
    case "percent":
      return percent(datum, opts, ctx2);
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
  let width = 0;
  for (const ch of text.replace(ANSI, "")) width += charWidth(ch.codePointAt(0));
  return width;
}
function clip(text, width) {
  if (width <= 0) return "";
  if (visibleWidth(text) <= width) return text;
  const budget = width - 1;
  let out = "";
  let used = 0;
  let styled = false;
  for (let i = 0; i < text.length; ) {
    if (text[i] === "\x1B") {
      let end = text.indexOf("m", i);
      if (end === -1) end = text.length - 1;
      const seq = text.slice(i, end + 1);
      out += seq;
      const codes = seq.slice(2, seq.length - 1);
      styled = codes !== "" && codes !== "0";
      i = end + 1;
      continue;
    }
    const cp = text.codePointAt(i);
    const w = charWidth(cp);
    if (used + w > budget) break;
    out += String.fromCodePoint(cp);
    used += w;
    i += String.fromCodePoint(cp).length;
  }
  out += "\u2026";
  if (styled) out += "\x1B[0m";
  return out;
}
function charWidth(cp) {
  if (cp === 8203 || cp === 8205 || cp === 65279 || cp >= 768 && cp <= 879 || cp >= 6832 && cp <= 6911 || cp >= 7616 && cp <= 7679 || cp >= 8400 && cp <= 8447 || cp >= 65024 && cp <= 65039 || cp >= 65056 && cp <= 65071)
    return 0;
  if (cp >= 4352 && cp <= 4447 || cp >= 11904 && cp <= 12350 || cp >= 12353 && cp <= 13311 || cp >= 13312 && cp <= 19903 || cp >= 19968 && cp <= 40959 || cp >= 40960 && cp <= 42191 || cp >= 44032 && cp <= 55203 || cp >= 63744 && cp <= 64255 || cp >= 65072 && cp <= 65103 || cp >= 65280 && cp <= 65376 || cp >= 65504 && cp <= 65510 || cp >= 127744 && cp <= 129791 || cp >= 131072 && cp <= 262141)
    return 2;
  return 1;
}

// src/layout.ts
function compose(left, center, right, columns2, margin) {
  const target = columns2 - margin;
  if (!center && !right) return clip(left, target);
  const lw = visibleWidth(left);
  const rw = visibleWidth(right);
  if (!center) return leftRight(left, lw, right, rw, target);
  const cw = visibleWidth(center);
  const free = target - lw - cw - rw;
  if (free < 4) return leftRight(left, lw, right, rw, target);
  let gapLeft = Math.floor((target - cw) / 2) - lw;
  let gapRight = target - rw - (Math.floor((target - cw) / 2) + cw);
  if (gapLeft < 1 || gapRight < 1) {
    gapLeft = Math.floor(free / 2);
    gapRight = free - gapLeft;
  }
  return left + " ".repeat(gapLeft) + center + " ".repeat(gapRight) + right;
}
function leftRight(left, lw, right, rw, target) {
  const gap = target - lw - rw;
  if (gap >= 1) return left + " ".repeat(gap) + right;
  if (rw >= target) return clip(right, target);
  return clip(left, target - rw - 1) + " " + right;
}

// src/powerline.ts
var ARROW = String.fromCodePoint(57520);
var AUTO_BG = ["#3b3b3b", "#2f2f2f"];
function powerlineZone(segs) {
  const resolved2 = segs.map((s, i) => ({
    text: s.text,
    bg: s.bg ?? bgCode(AUTO_BG[i % AUTO_BG.length])
  }));
  let out = "";
  resolved2.forEach((s, i) => {
    out += fill(` ${s.text} `, s.bg);
    const next = resolved2[i + 1];
    const fg = bgToFg(s.bg);
    out += next ? `\x1B[${fg};${next.bg}m${ARROW}\x1B[0m` : `\x1B[${fg}m${ARROW}\x1B[0m`;
  });
  return out;
}

// src/render.ts
function render(config2, ctx2, columns2) {
  const sep = ` ${paint(sanitize(config2.separator), "dim")} `;
  const out = [];
  for (const line of config2.lines) {
    const rendered = renderLine(line, ctx2, config2, columns2, sep);
    if (rendered !== null) out.push(rendered);
  }
  return out;
}
function renderLine(line, ctx2, config2, columns2, sep) {
  const zones = Array.isArray(line) ? { left: line } : line;
  const left = renderZone(zones.left, ctx2, sep, config2.powerline);
  const center = renderZone(zones.center, ctx2, sep, config2.powerline);
  const right = renderZone(zones.right, ctx2, sep, config2.powerline);
  if (!left && !center && !right) return null;
  return compose(left, center, right, columns2, config2.margin);
}
function renderZone(items, ctx2, sep, powerline) {
  if (!items) return "";
  const segs = [];
  for (const item of items) {
    const text = renderItem(item, ctx2);
    if (!text) continue;
    const word = itemBg(item);
    segs.push({ text, bg: word ? bgCode(word) : null });
  }
  if (segs.length === 0) return "";
  return powerline ? powerlineZone(segs) : segs.map((s) => s.text).join(sep);
}
function itemBg(item) {
  if (typeof item === "string") return void 0;
  if (Array.isArray(item)) return typeof item[1] === "object" ? item[1].bg : void 0;
  return item.bg;
}
function renderItem(item, ctx2) {
  if (typeof item === "object" && !Array.isArray(item)) {
    if (!item.text) return null;
    const text = sanitize(item.text);
    return item.color || item.bg ? paint(text, item.color, item.bg) : text;
  }
  const [id, raw2] = Array.isArray(item) ? item : [item, void 0];
  const opts = typeof raw2 === "string" ? isStyle(raw2) ? { color: raw2 } : { variant: raw2 } : raw2 ?? {};
  const widget = registry[id];
  if (!widget) return ctx2.commands?.get(id) ?? null;
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
var { commands, usesGit, usesHistory } = scan(config.lines);
var now = Math.floor(Date.now() / 1e3);
var ctx = {
  payload,
  git: usesGit ? readGit(dir, payload.workspace?.git_worktree) : {},
  thresholds: {
    warning: config.contextWarningAt,
    critical: config.contextCriticalAt,
    usageWarning: config.usageWarningAt,
    usageCritical: config.usageCriticalAt
  },
  now,
  history: usesHistory ? sampleHistory(payload.session_id, contextPercent(payload), payload.cost?.total_cost_usd ?? null, now) : void 0
};
var resolved = await Promise.all(commands.map((cmd) => runCommand(cmd, ctx).then((out) => [cmd, out])));
ctx.commands = new Map(resolved);
var columns = Number(process.env.COLUMNS) || 80;
try {
  const lines2 = render(config, ctx, columns);
  if (lines2.length > 0) process.stdout.write(`${lines2.join("\n")}
`);
} catch {
}
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}
