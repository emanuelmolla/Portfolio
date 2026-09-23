import { themes } from '@/themes/registry'
import type { ColorScheme } from '@/lib/theme/resolve'

/**
 * The appearance switcher: a fixed overlay control, bottom-right, on every
 * screen of every theme.
 *
 * Deliberately NOT owned by a theme. It was previously placed by each theme
 * (header in clean, dock in desktop) and that was wrong twice over: the
 * position moved as you switched, and a visitor who lands in an unfamiliar
 * theme has to hunt for the way out of it. A control that exists to change
 * themes must be in the same place regardless of theme.
 *
 * Two sections because these are genuinely two axes: a theme is which renderer
 * draws the site, a mode is which palette it draws with. Every theme supports
 * both modes, so dark is not a theme.
 *
 * Built on <details>/<summary>: the disclosure works with JavaScript disabled
 * and ships no client bundle. Each item is an anchor to the appearance route
 * handler, which sets a cookie and redirects back, so ?theme= never survives
 * into history or the index.
 */

interface Props {
  path: string
  currentTheme: string
  currentScheme: ColorScheme
}

const SCHEMES: { value: ColorScheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Match system' },
]

function href(params: Record<string, string>, path: string) {
  return `/api/appearance?${new URLSearchParams({ ...params, from: path }).toString()}`
}

function Item({
  href: to,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <a
      href={to}
      aria-current={active ? 'true' : undefined}
      className="flex items-center gap-2.5 px-3 py-1.5 text-[13px] text-[var(--muted)] hover:bg-[var(--selection)] hover:text-[var(--ink)]"
    >
      <span
        aria-hidden
        className={`h-1 w-1 shrink-0 rounded-full ${
          active ? 'bg-[var(--accent)]' : 'bg-transparent'
        }`}
      />
      <span className={active ? 'text-[var(--ink)]' : undefined}>{children}</span>
    </a>
  )
}

export function AppearanceMenu({ path, currentTheme, currentScheme }: Props) {
  return (
    <details className="group fixed bottom-5 right-5 z-50">
      <summary
        aria-label="Appearance settings"
        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-[var(--rule)] bg-[var(--raised)] text-[var(--muted)] shadow-[var(--shadow)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] [&::-webkit-details-marker]:hidden"
      >
        {/* Sliders glyph: reads as "settings" without being a gear, which is
            the single most overused icon on the web. */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M2 4.5h6M11 4.5h3" stroke="currentColor" strokeWidth="1.3" />
          <path d="M2 11.5h3M8 11.5h6" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="9.5" cy="4.5" r="1.8" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="6.5" cy="11.5" r="1.8" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </summary>

      <div className="absolute bottom-full right-0 mb-2 min-w-[12rem] overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--raised)] py-1.5 shadow-[var(--shadow)]">
        <p className="px-3 pb-1 pt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--faint)]">
          Theme
        </p>
        {Object.values(themes).map((t) => (
          <Item key={t.id} href={href({ theme: t.id }, path)} active={t.id === currentTheme}>
            {t.name}
          </Item>
        ))}

        <hr className="my-1.5 border-t border-[var(--rule)]" />

        <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--faint)]">
          Mode
        </p>
        {SCHEMES.map((s) => (
          <Item
            key={s.value}
            href={href({ scheme: s.value }, path)}
            active={s.value === currentScheme}
          >
            {s.label}
          </Item>
        ))}
      </div>
    </details>
  )
}
