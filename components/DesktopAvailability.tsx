'use client'

import { useEffect } from 'react'
import { DESKTOP_MIN_WIDTH } from '@/lib/theme/appearance'

/** A saved desktop preference must not strand visitors on a smaller screen. */
export function DesktopAvailability({ path }: { path: string }) {
  useEffect(() => {
    const screen = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`)
    const check = () => {
      if (!screen.matches)
        window.location.replace(
          `/api/appearance?${new URLSearchParams({ theme: 'clean', from: path })}`
        )
    }
    check()
    screen.addEventListener('change', check)
    return () => screen.removeEventListener('change', check)
  }, [path])
  return (
    <noscript>
      <p className="desktop-availability-note">
        This theme is designed for a laptop or larger screen.{' '}
        <a
          href={`/api/appearance?${new URLSearchParams({ theme: 'clean', from: path })}`}
        >
          Open Minimal instead
        </a>
        .
      </p>
    </noscript>
  )
}
