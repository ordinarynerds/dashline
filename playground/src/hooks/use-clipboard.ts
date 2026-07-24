import { useCallback, useRef, useState } from 'react'

// Copy text to the clipboard and briefly flag success, for copy-button affordances.
export function useClipboard(resetMs = 1400) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = useCallback(
    (text: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true)
          if (timer.current) clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(false), resetMs)
        })
        .catch(() => {})
    },
    [resetMs],
  )

  return { copied, copy }
}
