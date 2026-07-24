import type { Percent } from "../datum.ts";
import type { Ctx, WidgetOpts } from "../widgets/types.ts";
import { paint, styleTerm } from "../style.ts";
import { bar, clampWidth } from "../util/bar.ts";
import { gradientBar } from "./gradient.ts";
import { human, countdown, spark } from "../util/format.ts";

const DEFAULT_WIDTH = 10;

export function percent(d: Percent, opts: WidgetOpts, ctx: Ctx): string {
  const color = opts.color ?? fillColor(d, opts, ctx);
  const width = clampWidth(opts.width ?? DEFAULT_WIDTH);
  const number = paint(`${Math.round(d.value)}%`, styleTerm(`bold ${color}`, opts));
  const meter =
    opts.bar === "gradient"
      ? gradientBar(d.value, width, opts)
      : paint(bar(d.value, width, opts.bar), styleTerm(color, opts));

  switch (opts.variant) {
    case "pct":
      return number;
    case "bar":
      return meter;
    case "gauge":
      return paint(`▕${bar(d.value, width, opts.bar)}▏`, styleTerm(color, opts));
    case "ratio":
      return d.tokens
        ? paint(`${human(d.tokens.used)}/${human(d.tokens.size)}`, styleTerm(color, opts))
        : number;
    case "tokens":
      return d.tokens ? paint(tokens(d), "dim") : number;
    case "history":
      return history(ctx) ?? number;
  }

  const label = opts.label ?? d.label;
  const parts: string[] = [];
  if (label) parts.push(paint(label, "dim"));
  parts.push(number);
  if (opts.trend && d.scale === "context") {
    const arrow = trendArrow(ctx, d.value);
    if (arrow) parts.push(arrow);
  }
  if (d.defaultBar || opts.bar) parts.push(meter);
  if (d.tokens) parts.push(paint(tokens(d), "dim"));
  if (d.hint && d.value >= ctx.thresholds.critical) {
    parts.push(
      `${paint("→ /compact", "bold red")} ${paint("[focus instructions]", "dim")}`,
    );
  } else if (d.hint && d.value >= ctx.thresholds.warning) {
    parts.push(paint("· high", "yellow"));
  }
  if (d.reset && opts.countdown !== false)
    parts.push(paint(`(↻${countdown(d.reset, ctx.now)})`, "dim"));
  return parts.join(" ");
}

function tokens(d: Percent): string {
  return `(${human(d.tokens!.used)}/${human(d.tokens!.size)})`;
}

// The recent context history drawn as a sparkline, colored by the latest fill. Needs a
// couple of samples; null until then, so the caller falls back to the number.
function history(ctx: Ctx): string | null {
  const values = (ctx.history ?? []).filter((s) => s.ctx != null).map((s) => s.ctx!);
  if (values.length < 2) return null;
  const recent = values.slice(-20);
  const last = recent[recent.length - 1]!;
  const t = ctx.thresholds;
  const color = last >= t.critical ? "red" : last >= t.warning ? "yellow" : "green";
  return paint(spark(recent), color);
}

// Direction of context over the recent history: rising is a warning color, falling a good
// one. Needs a few samples; null until then.
function trendArrow(ctx: Ctx, current: number): string | null {
  const values = (ctx.history ?? []).filter((s) => s.ctx != null).map((s) => s.ctx!);
  if (values.length < 3) return null;
  const prev = values[Math.max(0, values.length - 6)]!;
  const delta = current - prev;
  if (delta > 1) return paint("↑", "yellow");
  if (delta < -1) return paint("↓", "green");
  return paint("→", "dim");
}

function fillColor(d: Percent, opts: WidgetOpts, ctx: Ctx): string {
  const t = ctx.thresholds;
  const warning =
    opts.warningAt ?? (d.scale === "context" ? t.warning : t.usageWarning);
  const critical =
    opts.criticalAt ?? (d.scale === "context" ? t.critical : t.usageCritical);
  return d.value >= critical ? "red" : d.value >= warning ? "yellow" : "green";
}
