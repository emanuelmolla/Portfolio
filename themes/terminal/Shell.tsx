'use client'
import { useRef, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import type { ThemeModule } from '@/lib/theme/contract'
import { complete, execute, fileSystem, workingDirectory } from './commands'
import {
  appendOutput,
  clearSession,
  emptySession,
  hidePage,
  readPage,
  readSession,
  subscribeSession,
} from './session'
import './terminal.css'
import { Output } from './Output'
export const Shell: ThemeModule['Shell'] = ({
  children,
  nav,
  siteName,
  path,
}) => {
  const router = useRouter()
  const content = useRef<HTMLDivElement>(null)
  const knownPaths = useRef(new Set<string>())
  const [value, setValue] = useState('')
  const { history, lines, readPath, hiddenPath } = useSyncExternalStore(
    subscribeSession,
    readSession,
    () => emptySession
  )
  const showPage = hiddenPath !== path && (path !== '/' || readPath === '/')
  const [historyCursor, setCursor] = useState<number | null>(null)
  const cursor = historyCursor ?? history.length
  const [draft, setDraft] = useState('')
  const cwd = workingDirectory(path)
  function entries() {
    const hrefs = Array.from(
      content.current?.querySelectorAll<HTMLAnchorElement>('a[href^="/"]') ?? []
    )
      .map((link) => link.getAttribute('href')!)
      .filter((href) => !href.includes('#') && !href.includes('?'))
    for (const href of [path, ...nav.map((item) => item.href), ...hrefs])
      knownPaths.current.add(href)
    return fileSystem([...knownPaths.current])
  }
  function run(command: string) {
    if (!command.trim()) return
    const result = execute(command, cwd, entries(), history)
    if (result.clear) {
      clearSession(path)
    } else {
      if (showPage) {
        appendOutput({ command: '', output: '', content: children }, false)
        hidePage(path)
      }
      appendOutput({ command, output: result.output })
      if (result.href) readPage(result.href)
    }
    setCursor(null)
    setValue('')
    setDraft('')
    if (result.href && result.href !== path) router.push(result.href)
  }
  return (
    <div className="terminal-shell">
      <main className="terminal-console" aria-label="Portfolio terminal">
        <Output
          siteName={siteName}
          path={path}
          lines={lines}
          showPage={showPage}
          showWelcome={hiddenPath !== path}
          contentRef={content}
        >
          {children}
        </Output>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            run(value)
          }}
        >
          <label htmlFor="terminal-command">
            <span className="terminal-sr-only">Command</span>
            <span>{cwd} $</span>
          </label>
          <div className="terminal-input-row">
            <input
              id="terminal-command"
              value={value}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-describedby="terminal-key-help"
              onChange={(event) => {
                setValue(event.target.value)
                setCursor(null)
              }}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                  event.preventDefault()
                  if (
                    !history.length ||
                    (cursor === history.length && event.key === 'ArrowDown')
                  )
                    return
                  if (cursor === history.length) setDraft(value)
                  const next = Math.max(
                    0,
                    Math.min(
                      history.length,
                      cursor + (event.key === 'ArrowUp' ? -1 : 1)
                    )
                  )
                  setCursor(next)
                  setValue(
                    next === history.length ? draft : (history[next] ?? '')
                  )
                } else if (event.key === 'Tab' && !event.shiftKey) {
                  const matches = complete(value, cwd, entries())
                  if (matches.length) {
                    event.preventDefault()
                    if (matches.length === 1) setValue(matches[0])
                    else
                      appendOutput(
                        { command: value, output: matches.join('\n') },
                        false
                      )
                  }
                }
              }}
            />
          </div>
          <p id="terminal-key-help" className="terminal-sr-only">
            Up/Down: history. Tab: complete. Shift+Tab: leave prompt.
          </p>
        </form>
        <noscript>
          <style>{`.terminal-fallback { display: block !important; } .terminal-console > form { display: none; }`}</style>
          <p>
            Commands need JavaScript. Follow the links in the output to browse.
          </p>
        </noscript>
      </main>
    </div>
  )
}
