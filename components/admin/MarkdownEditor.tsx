'use client'

import { useMemo, useRef, useState } from 'react'
import { renderMarkdown } from '@/lib/markdown'

/**
 * The writing surface.
 *
 * WHY MARKDOWN AND NOT WYSIWYG. The body is stored as a markdown string because
 * three themes have to render it and each maps the parsed tree to its own
 * components (see lib/models/post.ts). A WYSIWYG editor holds its own document
 * model and serialises to markdown on the way out, which means the editor's idea
 * of what markdown means and `marked`'s idea have to agree forever. They drift,
 * and the drift shows up as mangled content in the published post.
 *
 * So this is rich EDITING over plain markdown: a toolbar, shortcuts, and a live
 * preview rendered by importing the exact function the server uses. That last
 * part is the real benefit over a WYSIWYG. The preview is not an approximation of
 * the result, it is the result, produced by the same parser with the same
 * options. What is on the right is what ships.
 *
 * Known gap: images are a URL, not an upload. There is no asset pipeline yet, so
 * pretending otherwise with a file picker would be a button that cannot work.
 */

type Mode = 'write' | 'split' | 'preview'

/** Matches the 230 wpm figure PostSchema.pre('save') uses, so the count agrees. */
const WORDS_PER_MINUTE = 230

export function MarkdownEditor({
  name,
  defaultValue = '',
  label = 'Body',
  error,
  hint,
  minRows,
}: {
  name: string
  defaultValue?: string | null
  label?: string
  error?: string
  hint?: string
  minRows?: number
}) {
  const [value, setValue] = useState(defaultValue ?? '')
  const [mode, setMode] = useState<Mode>('write')
  const ref = useRef<HTMLTextAreaElement>(null)

  // Only re-parsed when the text actually changes, not on a mode toggle.
  const html = useMemo(() => renderMarkdown(value), [value])

  const words = useMemo(() => value.trim().split(/\s+/).filter(Boolean).length, [value])
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE))

  /**
   * Replace a range, preserving the browser's native undo stack.
   *
   * execCommand is deprecated and still the only way to edit a textarea such that
   * ctrl+Z continues to work: assigning to .value wipes the undo history
   * outright, which makes every toolbar click an unrecoverable edit. The direct
   * path is kept as a fallback for engines that have dropped it, accepting the
   * loss of undo there rather than the loss of the button.
   */
  const replace = (start: number, end: number, text: string, from: number, to: number) => {
    const el = ref.current
    if (!el) return

    el.focus()
    el.setSelectionRange(start, end)

    let inserted = false
    try {
      inserted = document.execCommand('insertText', false, text)
    } catch {
      inserted = false
    }

    if (!inserted) {
      el.setRangeText(text, start, end, 'end')
      // React never saw an input event on this path, so state is synced by hand.
      setValue(el.value)
    }

    // After the frame, because on the execCommand path React re-renders in
    // response to the input event and would otherwise move the caret to the end.
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(from, to)
    })
  }

  /** Wrap the selection, or unwrap it if it is already wrapped. */
  const surround = (before: string, after: string, placeholder: string) => {
    const el = ref.current
    if (!el) return

    const { selectionStart: start, selectionEnd: end } = el
    const text = el.value

    const wrapped =
      text.slice(start - before.length, start) === before &&
      text.slice(end, end + after.length) === after

    if (wrapped) {
      const inner = text.slice(start, end)
      replace(start - before.length, end + after.length, inner, start - before.length, end - before.length)
      return
    }

    const selected = text.slice(start, end) || placeholder
    replace(
      start,
      end,
      `${before}${selected}${after}`,
      start + before.length,
      start + before.length + selected.length
    )
  }

  /**
   * Apply or remove a line prefix across every line the selection touches.
   *
   * `family` strips a competing marker of the same sort first, so clicking H3 on
   * an H2 line produces "### x" rather than "### ## x". `numbered` renumbers,
   * because an ordered list whose items all read "1." is a different list.
   */
  const prefixLines = (prefix: string, family: RegExp, numbered = false) => {
    const el = ref.current
    if (!el) return

    const text = el.value
    const start = text.lastIndexOf('\n', el.selectionStart - 1) + 1
    const rawEnd = text.indexOf('\n', el.selectionEnd)
    const end = rawEnd === -1 ? text.length : rawEnd

    const lines = text.slice(start, end).split('\n')
    const present = lines.every((line) => family.test(line))

    const next = lines
      .map((line, index) => {
        const bare = line.replace(family, '')
        if (present) return bare
        return `${numbered ? `${index + 1}. ` : prefix}${bare}`
      })
      .join('\n')

    replace(start, end, next, start, start + next.length)
  }

  /** A fenced code block around the selection, on its own lines. */
  const fence = () => {
    const el = ref.current
    if (!el) return

    const { selectionStart: start, selectionEnd: end } = el
    const selected = el.value.slice(start, end) || 'code'
    const leading = start > 0 && el.value[start - 1] !== '\n' ? '\n' : ''
    const text = `${leading}\`\`\`\n${selected}\n\`\`\`\n`

    replace(start, end, text, start + leading.length + 4, start + leading.length + 4 + selected.length)
  }

  const link = () => {
    const el = ref.current
    if (!el) return

    const { selectionStart: start, selectionEnd: end } = el
    const selected = el.value.slice(start, end)
    const isUrl = /^https?:\/\/\S+$/.test(selected.trim())

    // A selected URL becomes the target and the caret lands in the label. A
    // selected phrase becomes the label and the caret lands in the target. Either
    // way the next keystroke goes where the missing half belongs.
    if (isUrl) {
      const text = `[](${selected.trim()})`
      replace(start, end, text, start + 1, start + 1)
      return
    }

    const label_ = selected || 'link text'
    const text = `[${label_}](url)`
    replace(start, end, text, start + label_.length + 3, start + label_.length + 6)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.metaKey || event.ctrlKey)) return

    const key = event.key.toLowerCase()
    const shortcut: Record<string, () => void> = {
      b: () => surround('**', '**', 'bold'),
      i: () => surround('_', '_', 'italic'),
      k: link,
    }

    if (key in shortcut) {
      event.preventDefault()
      shortcut[key]()
    }
  }

  const showWrite = mode !== 'preview'
  const showPreview = mode !== 'write'

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
        <label className="a-label" htmlFor={name}>
          {label}
        </label>
        <div className="flex items-center gap-1" role="group" aria-label="Editor view">
          {(['write', 'split', 'preview'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              aria-pressed={mode === option}
              className={`a-btn a-btn-sm ${mode === option ? 'a-btn-primary' : 'a-btn-ghost'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="a-card overflow-hidden">
        <Toolbar
          disabled={mode === 'preview'}
          actions={{
            h2: () => prefixLines('## ', /^#{1,6}\s+/),
            h3: () => prefixLines('### ', /^#{1,6}\s+/),
            bold: () => surround('**', '**', 'bold'),
            italic: () => surround('_', '_', 'italic'),
            code: () => surround('`', '`', 'code'),
            block: fence,
            link,
            quote: () => prefixLines('> ', /^>\s+/),
            bullet: () => prefixLines('- ', /^[-*]\s+/),
            number: () => prefixLines('1. ', /^\d+\.\s+/, true),
            image: () => surround('![', '](url)', 'alt text'),
            rule: () => surround('\n---\n', '', ''),
          }}
        />

        <div className={`grid ${mode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {showWrite && (
            <textarea
              id={name}
              name={name}
              ref={ref}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={onKeyDown}
              spellCheck
              rows={minRows}
              placeholder="Write in markdown. The preview is rendered by the same parser the site uses."
              className="a-code w-full resize-y border-0 bg-transparent p-4 outline-none min-h-[clamp(20rem,52vh,40rem)]"
            />
          )}

          {showPreview && (
            <div
              className={`min-h-[clamp(20rem,52vh,40rem)] overflow-y-auto bg-[var(--a-panel-2)] p-4 ${
                mode === 'split' ? 'border-t border-[var(--a-line)] lg:border-t-0 lg:border-l' : ''
              }`}
            >
              {value.trim() === '' ? (
                <p className="a-hint">Nothing to preview yet.</p>
              ) : (
                <div
                  className="prose max-w-none text-[var(--a-ink)]"
                  // The author is the only person who can put content here, and it
                  // is the same HTML the public page will render. Sanitising the
                  // preview but not the page would make the preview a lie.
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--a-line)] bg-[var(--a-panel-2)] px-3 py-1.5">
          <span className="a-hint a-mono">
            {words} {words === 1 ? 'word' : 'words'} · about {minutes} min
          </span>
          <span className="a-hint">Cmd or Ctrl with B, I, K</span>
        </div>
      </div>

      {error ? (
        <p className="a-error mt-1.5">{error}</p>
      ) : (
        hint && <p className="a-hint mt-1.5">{hint}</p>
      )}
    </div>
  )
}

/* -------------------------------------------------------------- toolbar --- */

type ActionKey =
  | 'h2'
  | 'h3'
  | 'bold'
  | 'italic'
  | 'code'
  | 'block'
  | 'link'
  | 'quote'
  | 'bullet'
  | 'number'
  | 'image'
  | 'rule'

/**
 * Labels are text, not an icon set.
 *
 * A row of generic glyphs from whichever icon pack was nearest is one of the
 * clearest tells of a template, and "H2" is less ambiguous than any drawing of a
 * heading. The two that are genuinely symbols are set in the mono face so they
 * read as characters rather than as decoration.
 */
const BUTTONS: { key: ActionKey; label: string; title: string; mono?: boolean }[] = [
  { key: 'h2', label: 'H2', title: 'Heading', mono: true },
  { key: 'h3', label: 'H3', title: 'Subheading', mono: true },
  { key: 'bold', label: 'B', title: 'Bold (Cmd/Ctrl+B)', mono: true },
  { key: 'italic', label: 'I', title: 'Italic (Cmd/Ctrl+I)', mono: true },
  { key: 'link', label: 'Link', title: 'Link (Cmd/Ctrl+K)' },
  { key: 'code', label: 'Code', title: 'Inline code' },
  { key: 'block', label: 'Block', title: 'Code block' },
  { key: 'quote', label: 'Quote', title: 'Block quote' },
  { key: 'bullet', label: 'List', title: 'Bulleted list' },
  { key: 'number', label: 'Numbered', title: 'Numbered list' },
  { key: 'image', label: 'Image', title: 'Image by URL' },
  { key: 'rule', label: 'Rule', title: 'Horizontal rule' },
]

function Toolbar({
  actions,
  disabled,
}: {
  actions: Record<ActionKey, () => void>
  disabled: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--a-line)] bg-[var(--a-panel-2)] px-2 py-1.5">
      {BUTTONS.map((button) => (
        <button
          key={button.key}
          type="button"
          title={button.title}
          disabled={disabled}
          // Keeps focus and the selection in the textarea: a button that steals
          // focus on mousedown has nothing to format by the time it is clicked.
          onMouseDown={(event) => event.preventDefault()}
          onClick={actions[button.key]}
          className={`a-btn a-btn-sm a-btn-ghost ${button.mono ? 'a-mono' : ''}`}
        >
          {button.label}
        </button>
      ))}
    </div>
  )
}
