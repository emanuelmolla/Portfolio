import type { ReactNode, Ref } from 'react'
import type { OutputLine } from './session'

/** Server children stay in the console, including the native no-script fallback. */
export function Output({
  siteName,
  path,
  lines,
  showPage,
  showWelcome,
  children,
  contentRef,
}: {
  siteName: string
  path: string
  lines: readonly OutputLine[]
  showPage: boolean
  showWelcome: boolean
  children?: ReactNode
  contentRef?: Ref<HTMLDivElement>
}) {
  return (
    <div
      className="terminal-log"
      role="log"
      aria-label="Command output"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {showWelcome && (
        <p>Welcome to {siteName}&apos;s portfolio. Type help to begin.</p>
      )}
      {lines.map((line, index) => (
        <div key={index}>
          {line.command && <p className="terminal-echo">$ {line.command}</p>}
          {line.output && <pre>{line.output}</pre>}
          {line.content}
        </div>
      ))}
      <div ref={contentRef} id="terminal-content">
        {showPage ? (
          children
        ) : path === '/' ? (
          <details className="terminal-fallback">
            <summary>Read portfolio without commands</summary>
            {children}
          </details>
        ) : null}
      </div>
    </div>
  )
}
