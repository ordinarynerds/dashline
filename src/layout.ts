import { visibleWidth } from './util/width.ts'

export function compose(left: string, center: string, right: string, columns: number, margin: number): string {
  if (!center && !right) return left

  const target = columns - margin
  const lw = visibleWidth(left)
  const cw = visibleWidth(center)
  const rw = visibleWidth(right)

  if (!center) {
    const gap = target - lw - rw
    return gap < 3 ? `${left}   ${right}` : left + ' '.repeat(gap) + right
  }

  const free = target - lw - cw - rw
  if (free < 4) return [left, center, right].filter(Boolean).join('   ')

  let gapLeft = Math.floor((target - cw) / 2) - lw
  let gapRight = target - rw - (Math.floor((target - cw) / 2) + cw)
  if (gapLeft < 1 || gapRight < 1) {
    gapLeft = Math.floor(free / 2)
    gapRight = free - gapLeft
  }

  return left + ' '.repeat(gapLeft) + center + ' '.repeat(gapRight) + right
}
