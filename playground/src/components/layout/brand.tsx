import { cn } from '@/lib/utils'
import { OrdinaryNerdsMark } from './nerd-mark'
import { OrdinaryNerdsLockup } from './ordinary-nerds-lockup'

export { OrdinaryNerdsMark, OrdinaryNerdsLockup }

// The Ordinary Nerds signature: the official horizontal lockup, linked to the studio. Reversed
// to the foreground ink color on dark; hover dims rather than recolors, per the brand rules.
export function OrdinaryNerdsBrand({ className }: { className?: string }) {
  return (
    <a
      href="https://github.com/ordinarynerds"
      target="_blank"
      rel="noreferrer"
      aria-label="Ordinary Nerds"
      className={cn('group inline-flex', className)}
    >
      <OrdinaryNerdsLockup className="h-6 w-auto text-foreground transition-opacity group-hover:opacity-70" />
    </a>
  )
}
