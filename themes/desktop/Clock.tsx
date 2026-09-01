'use client'

import { useEffect, useState } from 'react'

/**
 * Taskbar clock.
 *
 * Client-only and deliberately empty on the server. Rendering a server
 * timestamp would either hydrate to a mismatch or display a time frozen at
 * build, and a wrong clock on a desktop metaphor is worse than no clock. The
 * reserved width stops the tray from jumping when it appears.
 */
export function Clock() {
  const [now, setNow] = useState<string | null>(null)

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat('en-CA', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date())

    setNow(format())
    const id = setInterval(() => setNow(format()), 15_000)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      className="tabular w-[4.5rem] text-right font-mono text-[11px] text-[var(--muted)]"
      suppressHydrationWarning
    >
      {now ?? ''}
    </span>
  )
}
