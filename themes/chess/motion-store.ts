const preferenceKey = 'clubroom-motion'
let memoryPaused = false
let storageAvailable = true
const preferenceListeners = new Set<() => void>()

export function readPaused() {
  if (!storageAvailable) return memoryPaused
  try {
    return window.localStorage.getItem(preferenceKey) === 'paused'
  } catch {
    storageAvailable = false
    return memoryPaused
  }
}
export function subscribePaused(change: () => void) {
  preferenceListeners.add(change)
  window.addEventListener('storage', change)
  return () => {
    preferenceListeners.delete(change)
    window.removeEventListener('storage', change)
  }
}
export function togglePaused() {
  memoryPaused = !readPaused()
  try {
    window.localStorage.setItem(
      preferenceKey,
      memoryPaused ? 'paused' : 'running',
    )
  } catch {
    storageAvailable = false
    /* The in-memory preference still works when storage is blocked. */
  }
  preferenceListeners.forEach((change) => change())
}

// One browser-side ticker survives route changes, without starting timers during SSR.
const clockListeners = new Set<() => void>()
let elapsedMs = 0
let timer: number | undefined
export const readClock = () => Math.floor(elapsedMs / 1000)
export function subscribeClock(change: () => void) {
  clockListeners.add(change)
  if (timer === undefined) {
    let previous = performance.now()
    timer = window.setInterval(() => {
      const now = performance.now()
      if (
        !readPaused() &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      )
        elapsedMs += now - previous
      previous = now
      clockListeners.forEach((listener) => listener())
    }, 250)
  }
  return () => {
    clockListeners.delete(change)
    if (!clockListeners.size) {
      window.clearInterval(timer)
      timer = undefined
    }
  }
}
