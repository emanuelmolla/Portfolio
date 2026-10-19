import type { ReactNode } from 'react'
export interface OutputLine {
  command: string
  output: string
  content?: ReactNode
}
interface Session {
  history: readonly string[]
  lines: readonly OutputLine[]
  readPath?: string
  hiddenPath?: string
}
export const emptySession: Session = { history: [], lines: [] }
let session = emptySession
const listeners = new Set<() => void>()
export const readSession = () => session
export function subscribeSession(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export function appendOutput(line: OutputLine, remember = true) {
  session = {
    ...session,
    history: remember
      ? [...session.history, line.command].slice(-100)
      : session.history,
    lines: [...session.lines, line].slice(-40),
  }
  listeners.forEach((listener) => listener())
}
export function clearSession(hiddenPath?: string) {
  session = { ...emptySession, hiddenPath }
  listeners.forEach((listener) => listener())
}
export function readPage(readPath: string) {
  session = { ...session, readPath, hiddenPath: undefined }
  listeners.forEach((listener) => listener())
}
export function hidePage(hiddenPath: string) {
  session = { ...session, hiddenPath }
  listeners.forEach((listener) => listener())
}
