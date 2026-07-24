import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const REPO = 'ordinarynerds/dashline'

function format(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

// GitHub-style star button. Links to the repo and shows the live star count when it can be
// fetched, degrading to just the button otherwise.
export function GitHubStars({ className }: { className?: string }) {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && typeof d.stargazers_count === 'number') setStars(d.stargazers_count)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return (
    <a
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex h-8 items-center overflow-hidden rounded-md border bg-card text-sm font-medium shadow-xs',
        'transition-[transform,background-color] duration-150 ease-[var(--ease-out)] hover:bg-accent active:scale-[0.97]',
        className,
      )}
    >
      <span className="flex items-center gap-1.5 px-3">
        <Star className="size-3.5" />
        Star
      </span>
      {stars !== null && (
        <span className="border-l bg-muted/40 px-3 py-1.5 font-mono text-xs tabular-nums text-muted-foreground">{format(stars)}</span>
      )}
    </a>
  )
}
