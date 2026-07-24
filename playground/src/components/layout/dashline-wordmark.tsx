import { cn } from '@/lib/utils'

// The Dashline wordmark, per the brand file (Paper node 5BS-0): "Dashline" in bold Geist Mono
// with a trailing coral underscore cursor. The underscore uses the primary token (Ordinary
// Nerds coral); size is inherited from the parent's font-size. `compact` reduces it to "D_" for
// the collapsed sidebar rail.
export function DashlineWordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('flex items-center gap-px font-mono leading-none font-bold', className)}>
      <span className="tracking-[-0.01em] text-foreground">{compact ? 'D' : 'Dashline'}</span>
      <span className="text-primary">_</span>
    </span>
  )
}
