'use client'

import { useSyncExternalStore } from 'react'

/**
 * Taskbar clock.
 *
 * Client-only and deliberately empty on the server. Rendering a server timestamp
 * would either hydrate to a mismatch or display a time frozen at build, and a
 * wrong clock on a desktop metaphor is worse than no clock. The reserved width
 * stops the tray from jumping when it appears.
 *
 * useSyncExternalStore rather than useState plus useEffect. The clock is not
 * React state, it is an external source being read, and setting state in an
 * effect body to seed it causes a second render pass on mount for no reason.
 * This hook exists for exactly this shape: subscribe to something outside React,
 * read a snapshot, and declare what the server sees.
 *
 * getSnapshot returns a fresh string each call, which is safe because React
 * compares with Object.is and two equal strings are equal. Returning a fresh
 * OBJECT here would loop forever.
 */

const format = (): string =>
  new Intl.DateTimeFormat('en-CA', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date())

function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, 15_000)
  return () => clearInterval(id)
}

/** Nothing on the server, so hydration has nothing to disagree about. */
const serverSnapshot = (): string => ''

export function Clock() {
  const now = useSyncExternalStore(subscribe, format, serverSnapshot)

  return (
    <span className="tabular w-[4.5rem] text-right font-mono text-[11px] text-[var(--muted)]">
      {now}
    </span>
  )
}
