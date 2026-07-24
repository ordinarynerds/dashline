import { visibleWidth, clip } from './util/width.ts'

export function compose(left: string, center: string, right: string, columns: number, margin: number): string {
  const target = columns - margin
  if (!center && !right) return clip(left, target)

  const lw = visibleWidth(left)
  const rw = visibleWidth(right)
  if (!center) return leftRight(left, lw, right, rw, target)

  const cw = visibleWidth(center)
  const free = target - lw - cw - rw
  if (free < 4) return leftRight(left, lw, right, rw, target)

  let gapLeft = Math.floor((target - cw) / 2) - lw
  let gapRight = target - rw - (Math.floor((target - cw) / 2) + cw)
  if (gapLeft < 1 || gapRight < 1) {
    gapLeft = Math.floor(free / 2)
    gapRight = free - gapLeft
  }
  return left + ' '.repeat(gapLeft) + center + ' '.repeat(gapRight) + right
}

// Right-align the right zone. When the two zones cannot both fit, keep the right zone
// and clip the left, so the line never overflows into a wrap.
function leftRight(left: string, lw: number, right: string, rw: number, target: number): string {
  const gap = target - lw - rw
  if (gap >= 1) return left + ' '.repeat(gap) + right
  if (rw >= target) return clip(right, target)
  return clip(left, target - rw - 1) + ' ' + right
}
