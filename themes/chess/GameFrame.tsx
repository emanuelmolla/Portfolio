'use client'

import { useContext, useSyncExternalStore } from 'react'
import { MotionContext } from './motion-context'
import { ClockDial } from './Clock'
import {
  readPaused,
  subscribePaused,
  togglePaused,
  readClock,
  subscribeClock,
} from './motion-store'

const motionQuery = '(prefers-reduced-motion: reduce)'
function subscribeMotion(change: () => void) {
  const media = window.matchMedia(motionQuery)
  media.addEventListener('change', change)
  return () => media.removeEventListener('change', change)
}

/** Server-rendered pages pass through this slot, without becoming client imports. */
export function GameFrame({ children }: { children: React.ReactNode }) {
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => false,
  )
  const manualPause = useSyncExternalStore(
    subscribePaused,
    readPaused,
    () => false,
  )
  const paused = manualPause || reduced
  return (
    <MotionContext.Provider
      value={{
        paused,
        reduced,
        toggle: togglePaused,
      }}
    >
      <div className="chess-room" data-motion={paused ? 'paused' : 'running'}>
        {children}
      </div>
    </MotionContext.Provider>
  )
}

export function GameHud({ section }: { section: string }) {
  const { paused, reduced, toggle } = useContext(MotionContext)
  const seconds = useSyncExternalStore(subscribeClock, readClock, () => 0)
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  return (
    <div className="chess-game-hud">
      <div className="chess-hud-location">
        <span className="chess-hud-emblem" aria-hidden="true">
          ♜
        </span>
        <span>
          Clubroom <span aria-hidden="true">/</span> <strong>{section}</strong>
        </span>
      </div>
      <details className="chess-clock-settings">
        <summary
          className="chess-session-clock"
          aria-label="Clock and motion settings"
          title="Clock and motion settings"
        >
          <span className={`chess-clock-face${paused ? '' : ' is-running'}`}>
            <ClockDial />
          </span>
          <span>
            <small>Session clock</small>
            <time aria-label={`Session clock ${time}`}>{time}</time>
          </span>
        </summary>
        <div className="chess-clock-popover">
          <label>
            <input
              type="checkbox"
              checked={!paused}
              onChange={toggle}
              disabled={reduced}
            />
            Animate Clubroom
          </label>
          <p>
            {reduced
              ? 'Your system preference reduces motion.'
              : 'Page transitions, scroll reveals, and clock hands.'}
          </p>
        </div>
      </details>
    </div>
  )
}
