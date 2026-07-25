import type { Widget } from './types.ts'
import { duration } from '../util/format.ts'

const MAX_ETA = 6 * 3600 // do not project further out than this

// Fits a line to the recent context history and, if it is climbing, projects when it will
// cross the critical threshold. Hidden when context is flat, falling, or already critical.
export const burn: Widget = {
  needs: { history: true },
  data(ctx) {
    const pts = (ctx.history ?? []).filter((s) => s.ctx != null).map((s) => ({ t: s.t, v: s.ctx! }))
    if (pts.length < 3) return null

    const slope = slopeOf(pts)
    if (slope <= 0) return null

    const last = pts[pts.length - 1]!
    const remaining = ctx.thresholds.critical - last.v
    if (remaining <= 0) return null

    const seconds = remaining / slope
    if (!Number.isFinite(seconds) || seconds > MAX_ETA) return null

    return { kind: 'label', text: `→ /compact ~${duration(seconds * 1000)}`, color: 'red' }
  },
}

function slopeOf(pts: { t: number; v: number }[]): number {
  const n = pts.length
  const t0 = pts[0]!.t
  let sx = 0
  let sy = 0
  let sxy = 0
  let sxx = 0
  for (const p of pts) {
    const x = p.t - t0
    sx += x
    sy += p.v
    sxy += x * p.v
    sxx += x * x
  }
  const denom = n * sxx - sx * sx
  return denom === 0 ? 0 : (n * sxy - sx * sy) / denom
}
