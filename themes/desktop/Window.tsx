'use client'

import {
  createContext,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { useRouter } from 'next/navigation'
import { FolderIcon } from './icons'
import {
  readDesktop,
  serverDesktop,
  subscribeDesktop,
  setMaximized,
} from './session'

type Visibility = 'open' | 'minimized' | 'closed'
const WindowContext = createContext<{
  visibility: Visibility
  change: (value: Visibility) => void
} | null>(null)

export function DesktopSession({
  children,
  path,
}: {
  children?: React.ReactNode
  path: string
}) {
  const router = useRouter()
  const [localVisibility, setVisibility] = useState<Visibility>('open')
  const visibility = path === '/' ? 'closed' : localVisibility
  function change(value: Visibility) {
    setVisibility(value)
    if (value === 'closed') {
      if (path !== '/') router.push('/')
    }
  }
  return (
    <WindowContext.Provider value={{ visibility, change }}>
      <div
        className="desktop-shell"
        data-window-state={visibility}
        onClickCapture={(event) => {
          const link = (event.target as Element).closest(
            'a[href]'
          ) as HTMLAnchorElement | null
          if (
            !link ||
            link.download ||
            link.target ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          )
            return
          const url = new URL(link.href, window.location.origin)
          if (url.origin !== window.location.origin) return
          if (link.hasAttribute('data-desktop-surface')) {
            event.preventDefault()
            change('closed')
            return
          }
          if (
            url.origin === window.location.origin &&
            url.pathname === path &&
            !url.hash &&
            !url.search
          ) {
            event.preventDefault()
            change('open')
          }
        }}
      >
        {children}
      </div>
    </WindowContext.Provider>
  )
}

export function DesktopWindow({
  title,
  children,
}: {
  title: string
  children?: React.ReactNode
}) {
  const { visibility, change } = useContext(WindowContext)!
  function hide(value: Visibility) {
    change(value)
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLAnchorElement>(
          '.desktop-taskbar a[aria-current="page"]'
        )
        ?.focus()
    )
  }
  const { maximized } = useSyncExternalStore(
    subscribeDesktop,
    readDesktop,
    serverDesktop
  )
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const drag = useRef<{
    x: number
    y: number
    offsetX: number
    offsetY: number
    left: number
    top: number
    right: number
  } | null>(null)
  function bound(x: number, y: number) {
    const origin = drag.current
    if (!origin) return { x, y }
    return {
      x: Math.max(
        120 - origin.right + origin.offsetX,
        Math.min(window.innerWidth - 160 - origin.left + origin.offsetX, x)
      ),
      y: Math.max(
        40 - origin.top + origin.offsetY,
        Math.min(window.innerHeight - 145 - origin.top + origin.offsetY, y)
      ),
    }
  }
  return (
    <section
      className={`desktop-window desktop-managed-window${maximized ? ' is-maximized' : ''}`}
      aria-label={title}
      hidden={visibility !== 'open'}
      style={
        maximized
          ? undefined
          : { transform: `translate(${position.x}px, ${position.y}px)` }
      }
    >
      <header
        className="desktop-titlebar"
        onDoubleClick={(event) => {
          if (!(event.target as Element).closest('button'))
            setMaximized(!maximized)
        }}
      >
        <span
          className="desktop-window-handle"
          tabIndex={0}
          role="group"
          aria-label="Move window. Arrow keys move, Home centres, Enter maximises."
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              setMaximized(!maximized)
            }
            if (event.key === 'Home') {
              event.preventDefault()
              setPosition({ x: 0, y: 0 })
            }
            const direction: Record<string, [number, number]> = {
              ArrowLeft: [-10, 0],
              ArrowRight: [10, 0],
              ArrowUp: [0, -10],
              ArrowDown: [0, 10],
            }
            if (!maximized && direction[event.key]) {
              event.preventDefault()
              const rect = event.currentTarget
                .closest('section')!
                .getBoundingClientRect()
              drag.current = {
                x: 0,
                y: 0,
                offsetX: position.x,
                offsetY: position.y,
                left: rect.left,
                top: rect.top,
                right: rect.right,
              }
              const [x, y] = direction[event.key]
              setPosition(bound(position.x + x, position.y + y))
              drag.current = null
            }
          }}
          onPointerDown={(event) => {
            if (maximized || event.button !== 0) return
            const rect = event.currentTarget
              .closest('section')!
              .getBoundingClientRect()
            drag.current = {
              x: event.clientX,
              y: event.clientY,
              offsetX: position.x,
              offsetY: position.y,
              left: rect.left,
              top: rect.top,
              right: rect.right,
            }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            const origin = drag.current
            if (origin)
              setPosition(
                bound(
                  origin.offsetX + event.clientX - origin.x,
                  origin.offsetY + event.clientY - origin.y
                )
              )
          }}
          onPointerUp={() => {
            drag.current = null
          }}
          onPointerCancel={() => {
            drag.current = null
          }}
        >
          <FolderIcon />
          {title}
        </span>
        <div className="desktop-window-controls">
          <button
            type="button"
            aria-label="Minimise window"
            title="Minimise"
            onClick={() => hide('minimized')}
          >
            −
          </button>
          <button
            type="button"
            aria-label={maximized ? 'Restore window size' : 'Maximise window'}
            title={maximized ? 'Restore' : 'Maximise'}
            onClick={() => setMaximized(!maximized)}
          >
            <svg
              viewBox="0 0 16 16"
              width="12"
              height="12"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              {maximized ? (
                <>
                  <path d="M5 5V2h9v9h-3" />
                  <path d="M2 5h9v9H2z" />
                </>
              ) : (
                <path d="M2.5 2.5h11v11h-11z" />
              )}
            </svg>
          </button>
          <button
            type="button"
            aria-label="Close window"
            title="Close"
            onClick={() => {
              hide('closed')
              setPosition({ x: 0, y: 0 })
            }}
          >
            ×
          </button>
        </div>
      </header>
      {children}
    </section>
  )
}
