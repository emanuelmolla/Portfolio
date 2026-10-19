'use client'

import Link from 'next/link'
import { useRef, useSyncExternalStore } from 'react'
import {
  moveNote,
  readDesktop,
  serverDesktop,
  subscribeDesktop,
} from './session'

function Note({
  id,
  children,
  label,
}: {
  id: 'welcome' | 'hello'
  children: React.ReactNode
  label: string
}) {
  const state = useSyncExternalStore(
    subscribeDesktop,
    readDesktop,
    serverDesktop
  )
  const position = state.notes[id]
  const drag = useRef<{
    x: number
    y: number
    startX: number
    startY: number
    left: number
    top: number
    right: number
    bottom: number
  } | null>(null)
  function move(x: number, y: number) {
    const origin = drag.current
    if (!origin) return
    moveNote(id, {
      x: Math.max(
        12 - origin.left + origin.startX,
        Math.min(window.innerWidth - 12 - origin.right + origin.startX, x)
      ),
      y: Math.max(
        45 - origin.top + origin.startY,
        Math.min(window.innerHeight - 95 - origin.bottom + origin.startY, y)
      ),
    })
  }
  return (
    <section
      tabIndex={0}
      role="group"
      aria-label={label}
      className="desktop-sticky-note"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${id === 'welcome' ? 2 : -3}deg)`,
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Home') {
          event.preventDefault()
          moveNote(id, { x: 0, y: 0 })
          return
        }
        const shifts: Record<string, [number, number]> = {
          ArrowLeft: [-10, 0],
          ArrowRight: [10, 0],
          ArrowUp: [0, -10],
          ArrowDown: [0, 10],
        }
        const offset = shifts[event.key]
        if (!offset) return
        event.preventDefault()
        const rect = event.currentTarget.getBoundingClientRect()
        drag.current = {
          x: 0,
          y: 0,
          startX: position.x,
          startY: position.y,
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
        }
        move(position.x + offset[0], position.y + offset[1])
        drag.current = null
      }}
      onPointerDown={(event) => {
        if (event.button !== 0 || (event.target as Element).closest('a,button'))
          return
        const rect = event.currentTarget.getBoundingClientRect()
        drag.current = {
          x: event.clientX,
          y: event.clientY,
          startX: position.x,
          startY: position.y,
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
        }
        event.currentTarget.setPointerCapture(event.pointerId)
        event.preventDefault()
      }}
      onPointerMove={(event) => {
        const origin = drag.current
        if (origin)
          move(
            origin.startX + event.clientX - origin.x,
            origin.startY + event.clientY - origin.y
          )
      }}
      onPointerUp={() => {
        drag.current = null
      }}
      onPointerCancel={() => {
        drag.current = null
      }}
    >
      {children}
    </section>
  )
}

export function StickyNotes({
  siteName,
  headline,
  resumeUrl,
  filename,
}: {
  siteName: string
  headline?: string
  resumeUrl: string
  filename: string
}) {
  return (
    <aside className="desktop-notes" aria-label="Desktop notes">
      <Note
        id="welcome"
        label="Welcome note. Arrow keys move it; Home resets its position."
      >
        <p>On my desk</p>
        <strong>{siteName}</strong>
        <span>{headline}</span>
        <Link href="/about">About me.md</Link>
        <Link href="/work">Projects</Link>
      </Note>
      <Note
        id="hello"
        label="Hello note. Arrow keys move it; Home resets its position."
      >
        <p>A note for you</p>
        <strong>Hi, I’m {siteName.split(' ')[0]}.</strong>
        <span>Thanks for stopping by.</span>
        <a href={resumeUrl} download={filename}>
          Take my résumé.pdf
        </a>
      </Note>
    </aside>
  )
}
