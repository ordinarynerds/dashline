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
  needs: { branch: true },
  data({ git }) {
    if (!git.branch) return null;
    return { kind: "label", text: git.branch, icon: "\u2387", color: "cyan" };
  }
};

// src/widgets/model.ts
var model = {
  data({ payload: payload2 }, opts) {
    if (opts.variant === "id") {
      const id = payload2.model?.id;
      return id ? { kind: "label", text: id, color: "dim" } : null;
    }
    const full = payload2.model?.display_name;
    if (!full) return null;
    if (opts.variant === "full") return { kind: "label", text: full, color: "bold" };
    return { kind: "label", text: full.replace(/\s*\([^)]*\)\s*$/, ""), color: "bold" };
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
var named = (label3, variant) => variant ? void 0 : label3;
var session = {
  data({ payload: payload2 }, opts) {
    const w = payload2.rate_limits?.five_hour;
    if (w?.used_percentage == null) return null;
    return {
      kind: "percent",
      value: w.used_percentage,
      scale: "usage",
      label: named("session", opts.variant),
      reset: w.resets_at
    };
  }
};
var weekly = {
  data({ payload: payload2 }, opts) {
    const w = payload2.rate_limits?.seven_day;
    if (w?.used_percentage == null) return null;
    return {
      kind: "percent",
      value: w.used_percentage,
      scale: "usage",
      label: named("All", opts.variant),
      reset: w.resets_at
    };
  }
};

// src/widgets/cost.ts
function periodOf(opts) {
  return opts.period === "week" || opts.period === "month" ? opts.period : "session";
}
var cost = {
  // Only the cross-session windows need the ledger read; the session total is already in the
  // payload. Declared as a function so a line showing plain session cost pays nothing for a
  // window it never asked for.
  needs: (opts) => periodOf(opts) === "session" ? {} : { ledger: true },
  data({ payload: payload2, ledger }, opts) {
    const period = periodOf(opts);
    if (period === "session") {
      const usd2 = payload2.cost?.total_cost_usd;
      return usd2 == null ? null : { kind: "money", usd: usd2 };
    }
    const usd = ledger?.[period];
    return usd == null ? null : { kind: "money", usd, label: named(period, opts.variant) };
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
  needs: { worktree: true },
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
    if (!r) return null;
    if (opts.variant === "owner") return r.owner ? { kind: "label", text: r.owner, color: "dim" } : null;
    if (opts.variant === "host") return r.host ? { kind: "label", text: r.host, color: "dim" } : null;
    if (!r.name) return null;
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
    if (opts.variant === "id") {
      const sid = payload2.session_id;
      return sid ? { kind: "label", text: sid.slice(0, 8), color: "dim" } : null;
    }
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

// src/widgets/burn.ts
var MAX_ETA = 6 * 3600;
var burn = {
  needs: { history: true },
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
    return { kind: "flag", on: Boolean(payload2.fast_mode), text: "fast" };
  }
};
var thinking = {
  data({ payload: payload2 }) {
    return { kind: "flag", on: Boolean(payload2.thinking?.enabled), text: "thinking" };
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

// src/widgets/dirty.ts
var dirty = {
  needs: { status: true },
  data({ git }, opts) {
    if (git.staged == null) return null;
    const staged = git.staged;
    const unstaged = git.unstaged ?? 0;
    const untracked = git.untracked ?? 0;
    const conflicts = git.conflicts ?? 0;
    const clean = !staged && !unstaged && !untracked && !conflicts;
    switch (opts.variant) {
      case "staged":
        return part(staged, "+", "green");
      case "unstaged":
        return part(unstaged, "*", "yellow");
      case "untracked":
        return part(untracked, "?", "red");
      case "conflicts":
        return part(conflicts, "!", "red");
      case "clean":
        return clean ? { kind: "label", text: "\u2713", color: "green" } : null;
      case "flags": {
        if (clean) return null;
        const text = `${staged ? "+" : ""}${unstaged ? "*" : ""}${untracked ? "?" : ""}${conflicts ? "!" : ""}`;
        return { kind: "label", text, color: conflicts ? "red" : "yellow" };
      }
      default: {
        if (clean) return null;
        const parts = [];
        if (staged) parts.push(`+${staged}`);
        if (unstaged) parts.push(`*${unstaged}`);
        if (untracked) parts.push(`?${untracked}`);
        if (conflicts) parts.push(`!${conflicts}`);
        return { kind: "label", text: parts.join(" "), color: conflicts ? "red" : "yellow" };
      }
    }
  }
};
function part(n, symbol, color) {
  return n ? { kind: "label", text: `${symbol}${n}`, color } : null;
}

// src/widgets/sync.ts
var sync = {
  needs: { status: true },
  data({ git }, opts) {
    const { ahead, behind } = git;
    if (ahead == null || behind == null) return null;
    if (opts.variant === "ahead") return ahead ? { kind: "label", text: `\u2191${ahead}`, color: "green" } : null;
    if (opts.variant === "behind") return behind ? { kind: "label", text: `\u2193${behind}`, color: "yellow" } : null;
    if (opts.variant === "synced") return !ahead && !behind ? { kind: "label", text: "\u2261", color: "green" } : null;
    if (!ahead && !behind) return null;
    const text = `${ahead ? `\u2191${ahead}` : ""}${behind ? `\u2193${behind}` : ""}`;
    return { kind: "label", text, color: behind ? "yellow" : "green" };
  }
};

// src/widgets/sha.ts
var sha = {
  needs: { sha: true },
  data({ git }) {
    if (!git.sha) return null;
    return { kind: "label", text: git.sha, color: "dim" };
  }
};

// src/widgets/stash.ts
var stash = {
  needs: { status: true },
  data({ git }) {
    if (!git.stash) return null;
    return { kind: "label", text: `\u2691${git.stash}`, color: "dim" };
  }
};

// src/widgets/diff.ts
var diff = {
  needs: { diff: true },
  data({ git }) {
    const added = git.added ?? 0;
    const removed = git.removed ?? 0;
    if (!added && !removed) return null;
    return { kind: "delta", added, removed };
  }
};

// src/widgets/rate.ts
var MIN_MS = 6e4;
var rate = {
  data({ payload: payload2 }) {
    const usd = payload2.cost?.total_cost_usd;
    const ms = payload2.cost?.total_duration_ms;
    if (usd == null || ms == null || ms < MIN_MS) return null;
    return { kind: "money", usd: usd / (ms / 36e5), suffix: "/h" };
  }
};

// src/widgets/host.ts
import { hostname } from "node:os";
var host = {
  data(_ctx, opts) {
    if (opts.variant === "ssh" && !process.env.SSH_CONNECTION && !process.env.SSH_TTY) return null;
    const name2 = hostname().replace(/\.local$/, "");
    if (!name2) return null;
    return { kind: "label", text: name2, color: "dim" };
  }
};

// src/widgets/time.ts
var time = {
  data({ now: now2 }, opts) {
    const d = new Date(now2 * 1e3);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    if (opts.variant === "seconds") return label(`${hh}:${mm}:${String(d.getSeconds()).padStart(2, "0")}`);
    if (opts.variant === "hm12") {
      const h12 = d.getHours() % 12 || 12;
      return label(`${h12}:${mm}${d.getHours() < 12 ? "am" : "pm"}`);
    }
    return label(`${hh}:${mm}`);
  }
};
function label(text) {
  return { kind: "label", text, color: "dim" };
}

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
  burn,
  fast,
  thinking,
  vim,
  agent,
  dirty,
  sync,
  sha,
  stash,
  diff,
  rate,
  host,
  time
};
var widgetNames = new Set(Object.keys(registry));

// src/style.ts
var CODES = {
  reset: "0",
  bold: "1",
  dim: "2",
  italic: "3",
  underline: "4",
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
var THEMES = {
  nord: { red: "#BF616A", green: "#A3BE8C", yellow: "#EBCB8B", blue: "#81A1C1", magenta: "#B48EAD", cyan: "#88C0D0", gray: "#4C566A", black: "#2E3440", white: "#ECEFF4" },
  dracula: { red: "#FF5555", green: "#50FA7B", yellow: "#F1FA8C", blue: "#6272A4", magenta: "#FF79C6", cyan: "#8BE9FD", gray: "#6272A4", black: "#282A36", white: "#F8F8F2" },
  gruvbox: { red: "#CC241D", green: "#98971A", yellow: "#D79921", blue: "#458588", magenta: "#B16286", cyan: "#689D6A", gray: "#928374", black: "#282828", white: "#EBDBB2" },
  catppuccin: { red: "#F38BA8", green: "#A6E3A1", yellow: "#F9E2AF", blue: "#89B4FA", magenta: "#CBA6F7", cyan: "#94E2D5", gray: "#6C7086", black: "#1E1E2E", white: "#CDD6F4" },
  // Built from dashline's own palette: the coral and cyan the project brands itself with,
  // with the rest of the ramp tuned to sit between them.
  ordinarynerds: { red: "#FF6B4A", green: "#3FCF8E", yellow: "#F2B441", blue: "#5AA9F0", magenta: "#C678DD", cyan: "#4EC9D6", gray: "#6B6B70", black: "#1C1C20", white: "#F5F5F5" }
};
var activeTheme = null;
function setTheme(name2) {
  activeTheme = name2 && THEMES[name2] ? THEMES[name2] : null;
}
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
  const rgb = themedHex(word);
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
function styleTerm(color, opts) {
  const words = [];
  if (color) words.push(color);
  if (opts.bold) words.push("bold");
  if (opts.italic) words.push("italic");
  if (opts.underline) words.push("underline");
  return words.length ? words.join(" ") : void 0;
}
function codesFor(word) {
  const rgb = themedHex(word);
  if (rgb) return `38;2;${rgb[0]};${rgb[1]};${rgb[2]}`;
  return word in CODES ? CODES[word] : null;
}
function themedHex(word) {
  const themed = activeTheme ? activeTheme[word] : void 0;
  return hex(themed ?? word);
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

// src/config.ts
var DEFAULTS = {
  separator: "\xB7",
  margin: 5,
  powerline: false,
  theme: "",
  icons: false,
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
  const home = process.env.CLAUDE_CONFIG_DIR ?? join(homedir2(), ".claude");
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
  const margin = clampInt(merged.margin, 0, 1e3, DEFAULTS.margin);
  return { ...DEFAULTS, ...merged, lines: lines2, margin };
}
function clampInt(value, min, max, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(Math.floor(value), max)) : fallback;
}
function withoutCommands(line) {
  if (Array.isArray(line)) return line.filter(keep);
  const zones = {};
  if (line.left) zones.left = line.left.filter(keep);
  if (line.center) zones.center = line.center.filter(keep);
  if (line.right) zones.right = line.right.filter(keep);
  return zones;
}
function itemOpts(item) {
  if (!Array.isArray(item)) return {};
  const raw2 = item[1];
  if (typeof raw2 === "string") return isStyle(raw2) ? { color: raw2 } : { variant: raw2 };
  return raw2 ?? {};
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
function readGit(dir2, worktreeHint, needs = {}) {
  if (!dir2) return {};
  let info = {};
  if (needs.status) {
    const status = readStatus(dir2);
    if (!status) return {};
    info = status;
  }
  const head = {
    branch: needs.branch && !needs.status,
    sha: needs.sha && !needs.status,
    worktree: needs.worktree && !worktreeHint
  };
  if (head.branch || head.sha || head.worktree) {
    const read2 = readHead(dir2, head);
    if (!read2) return needs.status ? info : {};
    info = { ...info, ...read2 };
  }
  if (needs.diff) Object.assign(info, readDiff(dir2));
  if (worktreeHint) info.worktree = worktreeHint;
  return info;
}
function readStatus(dir2) {
  const out = run(dir2, ["--no-optional-locks", "status", "--porcelain=v2", "--branch", "--show-stash", "--no-renames"]);
  if (out === void 0) return null;
  return parseStatus(out);
}
function parseStatus(out) {
  const info = { staged: 0, unstaged: 0, untracked: 0, conflicts: 0, stash: 0 };
  let detached = false;
  for (const line of out.split("\n")) {
    if (line.startsWith("# branch.oid ")) {
      const oid = line.slice(13);
      if (oid !== "(initial)") info.sha = oid.slice(0, 7);
    } else if (line.startsWith("# branch.head ")) {
      const head = line.slice(14);
      if (head === "(detached)") detached = true;
      else info.branch = head;
    } else if (line.startsWith("# branch.ab ")) {
      const m = /^\+(\d+) -(\d+)$/.exec(line.slice(12));
      if (m) {
        info.ahead = Number(m[1]);
        info.behind = Number(m[2]);
      }
    } else if (line.startsWith("# stash ")) {
      info.stash = Number(line.slice(8)) || 0;
    } else if (line.startsWith("1 ") || line.startsWith("2 ")) {
      if (line[2] !== ".") info.staged++;
      if (line[3] !== ".") info.unstaged++;
    } else if (line.startsWith("u ")) {
      info.conflicts++;
    } else if (line.startsWith("? ")) {
      info.untracked++;
    }
  }
  if (detached) info.branch = info.sha ?? "HEAD";
  return info;
}
function readHead(dir2, needs) {
  const args = ["rev-parse"];
  const fields = [];
  const wantHead = needs.branch || needs.sha;
  if (wantHead) {
    args.push("HEAD", "--abbrev-ref", "HEAD");
    fields.push("sha", "branch");
  }
  if (needs.worktree) {
    args.push("--absolute-git-dir", "--show-toplevel");
    fields.push("gitDir", "top");
  }
  const out = run(dir2, args);
  if (out === void 0) return null;
  const lines2 = out.split("\n");
  const at = (f) => lines2[fields.indexOf(f)];
  const info = {};
  if (wantHead) {
    const sha2 = at("sha")?.slice(0, 7);
    if (needs.sha) info.sha = sha2;
    const head = at("branch");
    if (head) info.branch = head === "HEAD" ? sha2 ?? "HEAD" : head;
  }
  if (needs.worktree && at("gitDir")?.includes("/worktrees/")) {
    const top = at("top");
    if (top) info.worktree = basename(top);
  }
  return info;
}
function readDiff(dir2) {
  const out = run(dir2, ["diff", "--shortstat", "HEAD"]);
  if (!out) return {};
  return {
    added: Number(/(\d+) insertion/.exec(out)?.[1] ?? 0),
    removed: Number(/(\d+) deletion/.exec(out)?.[1] ?? 0)
  };
}
function run(dir2, args) {
  try {
    return execFileSync("git", ["-C", dir2, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      // A status line must not hang the prompt: a slow or enormous repo yields nothing
      // rather than a stalled render.
      timeout: 1e3,
      maxBuffer: 8 * 1024 * 1024
    }).trim();
  } catch {
    return void 0;
  }
}

// src/scan.ts
var COMMAND_NEEDS = { branch: true, worktree: true };
function scan(lines2) {
  const commands2 = /* @__PURE__ */ new Set();
  const needs = {};
  for (const line of lines2) {
    const zones = Array.isArray(line) ? { left: line } : line;
    for (const items of [zones.left, zones.center, zones.right]) {
      if (!items) continue;
      for (const item of items) {
        if (usesHistoryItem(item)) needs.history = true;
        const id = itemId(item);
        if (id === null) continue;
        const widget = registry[id];
        if (widget) Object.assign(needs, typeof widget.needs === "function" ? widget.needs(itemOpts(item)) : widget.needs);
        else {
          commands2.add(id);
          Object.assign(needs, COMMAND_NEEDS);
        }
      }
    }
  }
  const { history: history2, ledger, ...gitNeeds2 } = needs;
  return {
    commands: [...commands2],
    usesGit: Object.values(gitNeeds2).some(Boolean),
    usesHistory: Boolean(history2),
    usesLedger: Boolean(ledger),
    gitNeeds: gitNeeds2
  };
}
function itemId(item) {
  if (typeof item === "string") return item;
  if (Array.isArray(item)) return item[0];
  return null;
}
function usesHistoryItem(item) {
  if (!Array.isArray(item)) return false;
  const opt = item[1];
  if (opt === "history") return true;
  return typeof opt === "object" && (opt.variant === "history" || Boolean(opt.trend));
}

// src/state.ts
import { readFileSync as readFileSync2, writeFileSync, renameSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { homedir as homedir3 } from "node:os";
import { join as join2 } from "node:path";
var GAP = 5;
var KEEP = 60;
var MAX_SESSIONS = 20;
var SESSION_TTL = 6 * 3600;
function stateDir() {
  const base = process.env.CLAUDE_CONFIG_DIR ?? join2(homedir3(), ".claude");
  return join2(base, "dashline-state");
}
function sampleHistory(sessionId, ctx2, cost2, now2) {
  const id = (sessionId ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!id) return [];
  const dir2 = stateDir();
  const file = join2(dir2, `${id}.json`);
  let samples = [];
  try {
    const parsed = JSON.parse(readFileSync2(file, "utf8"));
    if (Array.isArray(parsed)) samples = parsed;
  } catch {
  }
  const isNew = samples.length === 0;
  const last = samples[samples.length - 1];
  const appended = !last || now2 - last.t >= GAP;
  if (appended) {
    samples.push({ t: now2, ctx: ctx2, cost: cost2 });
    if (samples.length > KEEP) samples.splice(0, samples.length - KEEP);
  }
  if (appended) {
    try {
      mkdirSync(dir2, { recursive: true });
      const tmp = `${file}.tmp`;
      writeFileSync(tmp, JSON.stringify(samples));
      renameSync(tmp, file);
      if (isNew) prune(dir2, now2);
    } catch {
    }
  }
  return samples;
}
function prune(dir2, now2) {
  let files;
  try {
    files = readdirSync(dir2).filter((f) => f.endsWith(".json"));
  } catch {
    return;
  }
  const alive = [];
  for (const f of files) {
    const path = join2(dir2, f);
    try {
      const parsed = JSON.parse(readFileSync2(path, "utf8"));
      const samples = Array.isArray(parsed) ? parsed : [];
      const last = samples[samples.length - 1];
      if (!last || now2 - last.t > SESSION_TTL) rmSync(path, { force: true });
      else alive.push({ path, t: last.t });
    } catch {
      rmSync(path, { force: true });
    }
  }
  if (alive.length > MAX_SESSIONS) {
    alive.sort((a, b) => a.t - b.t).slice(0, alive.length - MAX_SESSIONS).forEach((x) => rmSync(x.path, { force: true }));
  }
}

// src/ledger.ts
import { readFileSync as readFileSync3, writeFileSync as writeFileSync2, renameSync as renameSync2, mkdirSync as mkdirSync2 } from "node:fs";
import { join as join3 } from "node:path";
var WEEK = 7 * 86400;
var GAP2 = 5;
function ledgerFile() {
  return join3(stateDir(), "spend.json");
}
function recordSpend(sessionId, usd, now2, resetsAt) {
  const id = (sessionId ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
  if (!id) return null;
  const week = weekStart(resetsAt, now2);
  const month = monthStart(now2);
  const keepFrom = Math.min(week, month);
  const file = ledgerFile();
  let ledger = {};
  try {
    const parsed = JSON.parse(readFileSync3(file, "utf8"));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) ledger = parsed;
  } catch {
  }
  for (const [key, entry] of Object.entries(ledger)) {
    if (!entry || typeof entry.t !== "number" || typeof entry.usd !== "number" || entry.t < keepFrom) delete ledger[key];
  }
  const own = ledger[id];
  if (usd != null && (!own || now2 - own.t >= GAP2 || usd !== own.usd)) {
    ledger[id] = { t: now2, usd };
    try {
      const dir2 = stateDir();
      mkdirSync2(dir2, { recursive: true });
      const tmp = `${file}.tmp`;
      writeFileSync2(tmp, JSON.stringify(ledger));
      renameSync2(tmp, file);
    } catch {
    }
  }
  const total = { week: 0, month: 0 };
  for (const entry of Object.values(ledger)) {
    if (entry.t >= week) total.week += entry.usd;
    if (entry.t >= month) total.month += entry.usd;
  }
  return total;
}
function weekStart(resetsAt, now2) {
  if (resetsAt == null || !Number.isFinite(resetsAt)) return now2 - WEEK;
  const start = resetsAt - WEEK;
  if (start + WEEK > now2) return start;
  return start + Math.floor((now2 - start) / WEEK) * WEEK;
}
function monthStart(now2) {
  const d = new Date(now2 * 1e3);
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime() / 1e3);
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

// src/util/bar.ts
var SETS = {
  blocks: { full: "\u2588", empty: "\u2591" },
  shade: { full: "\u2593", empty: "\u2591" },
  line: { full: "\u2501", empty: "\u2500" },
  ascii: { full: "#", empty: "-", wrap: ["[", "]"] }
};
var EIGHTHS = ["", "\u258F", "\u258E", "\u258D", "\u258C", "\u258B", "\u258A", "\u2589"];
var MAX_WIDTH = 1e3;
function clampWidth(width) {
  return Math.max(0, Math.min(Math.floor(width) || 0, MAX_WIDTH));
}
function bar(pct, rawWidth, style = "blocks") {
  const ratio = Math.min(100, Math.max(0, pct)) / 100;
  const width = clampWidth(rawWidth);
  if (style === "fine") return fine(ratio, width);
  const set = SETS[style] ?? SETS.blocks;
  const inner = set.wrap ? Math.max(0, width - 2) : width;
  const fill2 = Math.round(ratio * inner);
  const body2 = set.full.repeat(fill2) + set.empty.repeat(inner - fill2);
  return set.wrap ? set.wrap[0] + body2 + set.wrap[1] : body2;
}
function fine(ratio, width) {
  const eighths = Math.round(ratio * width * 8);
  const full = Math.floor(eighths / 8);
  const part2 = eighths % 8;
  const partial = part2 > 0 && full < width ? EIGHTHS[part2] : "";
  const empty = width - full - (partial ? 1 : 0);
  return "\u2588".repeat(Math.min(full, width)) + partial + "\u2591".repeat(Math.max(0, empty));
}
var barStyles = [...Object.keys(SETS), "fine"];

// src/present/gradient.ts
var GREEN = [53, 209, 59];
var YELLOW = [229, 185, 58];
var RED = [255, 85, 85];
function gradientBar(value, rawWidth, opts = {}) {
  const width = clampWidth(rawWidth);
  const attr = attrCodes(opts);
  const ratio = Math.min(100, Math.max(0, value)) / 100;
  const filled = Math.round(ratio * width);
  let out = "";
  for (let i = 0; i < width; i++) {
    if (i < filled) {
      const [r, g, b] = ramp(width === 1 ? 1 : i / (width - 1));
      out += `\x1B[38;2;${r};${g};${b}${attr}m\u2588`;
    } else {
      out += `\x1B[0;2${attr}m\u2591`;
    }
  }
  return `${out}\x1B[0m`;
}
function attrCodes(opts) {
  let s = "";
  if (opts.bold) s += ";1";
  if (opts.italic) s += ";3";
  if (opts.underline) s += ";4";
  return s;
}
function ramp(f) {
  return f <= 0.5 ? lerp(GREEN, YELLOW, f / 0.5) : lerp(YELLOW, RED, (f - 0.5) / 0.5);
}
function lerp(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
}

// src/present/percent.ts
var DEFAULT_WIDTH = 10;
function percent(d, opts, ctx2) {
  const color = opts.color ?? fillColor(d, opts, ctx2);
  const width = clampWidth(opts.width ?? DEFAULT_WIDTH);
  const number = paint(`${Math.round(d.value)}%`, styleTerm(`bold ${color}`, opts));
  const meter = opts.bar === "gradient" ? gradientBar(d.value, width, opts) : paint(bar(d.value, width, opts.bar), styleTerm(color, opts));
  switch (opts.variant) {
    case "pct":
      return number;
    case "bar":
      return meter;
    case "gauge":
      return paint(`\u2595${bar(d.value, width, opts.bar)}\u258F`, styleTerm(color, opts));
    case "ratio":
      return d.tokens ? paint(`${human(d.tokens.used)}/${human(d.tokens.size)}`, styleTerm(color, opts)) : number;
    case "tokens":
      return d.tokens ? paint(tokens(d), styleTerm("dim", opts)) : number;
    // Headroom rather than fill: what is left, not what is spent.
    case "left":
      return d.tokens ? paint(`${human(Math.max(0, d.tokens.size - d.tokens.used))} left`, styleTerm(color, opts)) : number;
    case "history":
      return history(ctx2, opts) ?? number;
  }
  const dim = styleTerm("dim", opts);
  const parts = [];
  parts.push(number);
  if (opts.trend && d.scale === "context") {
    const arrow = trendArrow(ctx2, d.value, opts);
    if (arrow) parts.push(arrow);
  }
  if (d.defaultBar || opts.bar) parts.push(meter);
  if (d.tokens) parts.push(paint(tokens(d), dim));
  if (d.hint && d.value >= ctx2.thresholds.critical) {
    parts.push(
      `${paint("\u2192 /compact", styleTerm("bold red", opts))} ${paint("[focus instructions]", dim)}`
    );
  } else if (d.hint && d.value >= ctx2.thresholds.warning) {
    parts.push(paint("\xB7 high", styleTerm("yellow", opts)));
  }
  if (d.reset && opts.countdown !== false)
    parts.push(paint(`(\u21BB${countdown(d.reset, ctx2.now)})`, dim));
  return parts.join(" ");
}
function tokens(d) {
  return `(${human(d.tokens.used)}/${human(d.tokens.size)})`;
}
function history(ctx2, opts) {
  const values = (ctx2.history ?? []).filter((s) => s.ctx != null).map((s) => s.ctx);
  if (values.length < 2) return null;
  const recent = values.slice(-20);
  const last = recent[recent.length - 1];
  const t = ctx2.thresholds;
  const color = last >= t.critical ? "red" : last >= t.warning ? "yellow" : "green";
  return paint(spark(recent), styleTerm(color, opts));
}
function trendArrow(ctx2, current, opts) {
  const values = (ctx2.history ?? []).filter((s) => s.ctx != null).map((s) => s.ctx);
  if (values.length < 3) return null;
  const prev = values[Math.max(0, values.length - 6)];
  const delta2 = current - prev;
  if (delta2 > 1) return paint("\u2191", styleTerm("yellow", opts));
  if (delta2 < -1) return paint("\u2193", styleTerm("green", opts));
  return paint("\u2192", styleTerm("dim", opts));
}
function fillColor(d, opts, ctx2) {
  const t = ctx2.thresholds;
  const warning = opts.warningAt ?? (d.scale === "context" ? t.warning : t.usageWarning);
  const critical = opts.criticalAt ?? (d.scale === "context" ? t.critical : t.usageCritical);
  return d.value >= critical ? "red" : d.value >= warning ? "yellow" : "green";
}

// src/present/scalars.ts
function duration3(d, opts) {
  const term = styleTerm(opts.color ?? "dim", opts);
  const { h, m, s } = hms(d.ms);
  if (opts.variant === "long") return paint(`${h}h${String(m).padStart(2, "0")}m`, term);
  if (opts.variant === "clock") {
    return paint(`${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`, term);
  }
  return paint(duration2(d.ms), term);
}
function money(d, opts) {
  const term = styleTerm(opts.color ?? "green", opts);
  const tail = d.suffix ?? "";
  if (opts.variant === "cents") return paint(`${Math.round(d.usd * 100)}c${tail}`, term);
  if (opts.variant === "round") return paint(`$${Math.round(d.usd)}${tail}`, term);
  return paint(`$${d.usd.toFixed(2)}${tail}`, term);
}
function delta(d, opts) {
  if (opts.variant === "added") return paint(`+${d.added}`, styleTerm(opts.color ?? "green", opts));
  if (opts.variant === "sum") {
    const net = d.added - d.removed;
    return paint(`${net >= 0 ? "+" : ""}${net}`, styleTerm(opts.color ?? (net >= 0 ? "green" : "red"), opts));
  }
  if (opts.color) return paint(`+${d.added} -${d.removed}`, styleTerm(opts.color, opts));
  return `${paint(`+${d.added}`, styleTerm("green", opts))} ${paint(`-${d.removed}`, styleTerm("red", opts))}`;
}
function flag(d, opts) {
  if (opts.variant === "onoff") return paint(`${d.text}:${d.on ? "on" : "off"}`, styleTerm(opts.color ?? (d.on ? "green" : "dim"), opts));
  return d.on ? paint(d.text, styleTerm(opts.color ?? "yellow", opts)) : null;
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

// src/present/label.ts
import { basename as basename2 } from "node:path";
function label2(d, opts) {
  let text = d.text;
  const v = opts.variant;
  if (v === "basename") text = basename2(text);
  else if (v === "upper") text = text.toUpperCase();
  else if (v === "lower") text = text.toLowerCase();
  const limit = opts.truncate ?? (v?.startsWith("truncate:") ? Number(v.slice("truncate:".length)) : 0);
  if (limit > 0) text = clip(text, limit);
  const color = opts.color ?? d.color;
  const term = styleTerm(color, opts);
  return term || opts.bg ? paint(text, term, opts.bg) : text;
}

// src/present/index.ts
function present(datum, opts, ctx2) {
  const text = body(datum, opts, ctx2);
  if (text == null || text === "") return null;
  return chrome(text, datum, opts);
}
function body(datum, opts, ctx2) {
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
      return label2(datum, opts);
    case "flag":
      return flag(datum, opts);
  }
}
function chrome(text, d, opts) {
  const out = [];
  const icon = opts.icon ?? d.icon;
  if (icon) out.push(paint(icon, styleTerm(d.iconColor ?? "dim", opts)));
  const label3 = opts.label ?? d.label;
  if (label3) out.push(paint(label3, styleTerm("dim", opts)));
  out.push(text);
  return out.join(" ");
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
var ARROW_RIGHT = String.fromCodePoint(57520);
var ARROW_LEFT = String.fromCodePoint(57522);
var AUTO_BG = ["#3b3b3b", "#2f2f2f"];
function powerlineZone(segs, direction = "left") {
  const resolved2 = segs.map((s, i) => ({
    text: s.text,
    bg: s.bg ?? bgCode(AUTO_BG[i % AUTO_BG.length])
  }));
  let out = "";
  if (direction === "right") {
    resolved2.forEach((s, i) => {
      const prev = resolved2[i - 1];
      const fg = bgToFg(s.bg);
      out += prev ? `\x1B[${fg};${prev.bg}m${ARROW_LEFT}\x1B[0m` : `\x1B[${fg}m${ARROW_LEFT}\x1B[0m`;
      out += fill(` ${s.text} `, s.bg);
    });
    return out;
  }
  resolved2.forEach((s, i) => {
    out += fill(` ${s.text} `, s.bg);
    const next = resolved2[i + 1];
    const fg = bgToFg(s.bg);
    out += next ? `\x1B[${fg};${next.bg}m${ARROW_RIGHT}\x1B[0m` : `\x1B[${fg}m${ARROW_RIGHT}\x1B[0m`;
  });
  return out;
}

// src/render.ts
var ICONS = Object.fromEntries(
  [
    ["branch", 57504],
    ["model", 61671],
    ["cwd", 61563],
    ["repo", 62465],
    ["pr", 62471],
    ["review", 62471],
    ["worktree", 61883],
    ["version", 61483],
    ["name", 62145],
    ["effort", 61668],
    ["output", 61459],
    ["cost", 61781],
    ["dirty", 61546],
    ["sync", 61676],
    ["sha", 62487],
    ["stash", 61831],
    ["host", 62003],
    ["time", 61463]
  ].map(([id, cp]) => [id, String.fromCodePoint(cp)])
);
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
  const left = renderZone(zones.left, ctx2, sep, config2, "left");
  const center = renderZone(zones.center, ctx2, sep, config2, "left");
  const right = renderZone(zones.right, ctx2, sep, config2, "right");
  if (!left && !center && !right) return null;
  return compose(left, center, right, columns2, config2.margin);
}
function renderZone(items, ctx2, sep, config2, direction) {
  if (!items) return "";
  const segs = [];
  for (const item of items) {
    const text = renderItem(item, ctx2, config2.icons);
    if (!text) continue;
    const word = itemBg(item);
    segs.push({ text, bg: word ? bgCode(word) : null });
  }
  if (segs.length === 0) return "";
  return config2.powerline ? powerlineZone(segs, direction) : segs.map((s) => s.text).join(sep);
}
function itemBg(item) {
  if (typeof item === "string") return void 0;
  if (Array.isArray(item)) return typeof item[1] === "object" ? item[1].bg : void 0;
  return item.bg;
}
function renderItem(item, ctx2, icons) {
  if (typeof item === "object" && !Array.isArray(item)) {
    if (!item.text) return null;
    const text = sanitize(item.text);
    return item.color || item.bg ? paint(text, item.color, item.bg) : text;
  }
  const id = Array.isArray(item) ? item[0] : item;
  let opts = itemOpts(item);
  const widget = registry[id];
  if (!widget) return ctx2.commands?.get(id) ?? null;
  if (icons && !opts.icon && ICONS[id]) opts = { ...opts, icon: ICONS[id] };
  try {
    const datum = widget.data(ctx2, opts);
    if (!datum) return null;
    const out = present(datum, opts, ctx2);
    return out == null || out === "" ? null : out;
  } catch {
    return null;
  }
}

// src/index.ts
var raw = await readStdin();
var payload = parsePayload(raw);
var config = loadConfig(payload);
setTheme(config.theme);
var dir = payload.workspace?.current_dir ?? payload.cwd;
var { commands, usesGit, usesHistory, usesLedger, gitNeeds } = scan(config.lines);
var now = Math.floor(Date.now() / 1e3);
var ctx = {
  payload,
  git: usesGit ? readGit(dir, payload.workspace?.git_worktree, gitNeeds) : {},
  thresholds: {
    warning: config.contextWarningAt,
    critical: config.contextCriticalAt,
    usageWarning: config.usageWarningAt,
    usageCritical: config.usageCriticalAt
  },
  now,
  history: usesHistory ? sampleHistory(payload.session_id, contextPercent(payload), payload.cost?.total_cost_usd ?? null, now) : void 0,
  ledger: usesLedger ? recordSpend(payload.session_id, payload.cost?.total_cost_usd ?? null, now, payload.rate_limits?.seven_day?.resets_at) : void 0
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
