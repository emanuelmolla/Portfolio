'use client'

import { useEffect, useRef, useState } from 'react'

const SEEN = 'portfolio-theme-guide-v1'
let seenThisSession = false

export function AppearanceGuide({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  function dismiss() {
    seenThisSession = true
    try {
      localStorage.setItem(SEEN, 'seen')
    } catch {
      /* Memory fallback for private browsing. */
    }
    setVisible(false)
  }
  useEffect(() => {
    let seen = seenThisSession
    try {
      seen ||= localStorage.getItem(SEEN) === 'seen'
    } catch {
      /* Storage is optional. */
    }
    if (seen) return
    const show = window.setTimeout(() => {
      if (seenThisSession) return
      seenThisSession = true
      try {
        localStorage.setItem(SEEN, 'seen')
      } catch {
        /* Storage is optional. */
      }
      setVisible(true)
    }, 3200)
    const hide = window.setTimeout(() => setVisible(false), 19000)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [])
  useEffect(() => {
    const details = root.current?.querySelector('details')
    function onToggle() {
      if (!details?.open) return
      seenThisSession = true
      try {
        localStorage.setItem(SEEN, 'seen')
      } catch {
        /* Storage is optional. */
      }
      setVisible(false)
    }
    details?.addEventListener('toggle', onToggle)
    return () => details?.removeEventListener('toggle', onToggle)
  }, [])
  function explore() {
    const details = root.current?.querySelector('details')
    if (details) {
      details.open = true
      details.querySelector('a')?.focus()
    }
    dismiss()
  }
  return (
    <div ref={root} className="appearance-widget">
      {visible && (
        <aside className="theme-guide" aria-label="Try another theme">
          <button
            type="button"
            className="theme-guide-dismiss"
            aria-label="Dismiss theme hint"
            onClick={dismiss}
          >
            ×
          </button>
          <button
            type="button"
            className="theme-guide-invite"
            onClick={explore}
          >
            <span>
              Same portfolio.
              <br />
              <strong>A different view?</strong>
              <small>Try the themes here.</small>
            </span>
            <svg
              className="theme-guide-cat"
              viewBox="0 0 88 80"
              width="70"
              height="64"
              aria-hidden="true"
            >
              <path
                className="cat-tail"
                d="M59 62c27 8 29-19 15-20"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M25 69c-4-10-2-23 5-29h24c8 8 10 21 6 29Z"
                fill="currentColor"
              />
              <path
                d="M20 31 21 9 35 18Q43 14 50 18L64 9l-1 23c-1 15-41 17-43-1Z"
                fill="currentColor"
              />
              <path d="m26 16 6 7-7 3m32-10-6 7 8 3" fill="var(--guide-ear)" />
              <path
                d="m31 31 5 1m14 0 5-1"
                stroke="var(--raised)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path d="m40 35 4 3 4-3" fill="var(--guide-ear)" />
              <path
                className="cat-paw"
                d="M48 48q10 5 17-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M30 68h9m10 0h9"
                stroke="var(--guide-ear)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </aside>
      )}
      {children}
    </div>
  )
}
