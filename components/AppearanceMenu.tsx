import { themes } from '@/themes/registry'
import type { ColorScheme } from '@/lib/theme/resolve'

/**
 * Appearance dropdown: which theme, and light/dark/auto.
 *
 * Two sections rather than one flat list, because they are genuinely two axes.
 * A theme is which renderer draws the site; a mode is which palette it draws
 * with. Every theme supports both modes, so "dark" is not a theme choice.
 *
 * Built on <details>/<summary>, so the disclosure works with JavaScript
 * disabled and needs no client bundle. Each item is a plain anchor to the
 * appearance route handler, which sets a cookie and redirects back, so the
 * ?theme= parameter never survives into history or the index.
 */

interface Props {
  path: string
  currentTheme: string
  currentScheme: ColorScheme
  /** Which edge to hang the panel from. Desktop opens upward from a taskbar. */
  align?: 'up' | 'down'
  label?: string
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
        className={`h-1 w-1 shrink-0 rounded-full ${active ? 'bg-[var(--accent)]' : 'bg-transparent'}`}
      />
      <span className={active ? 'text-[var(--ink)]' : undefined}>{children}</span>
    </a>
  )
}

export function AppearanceMenu({
  path,
  currentTheme,
  currentScheme,
  align = 'down',
  label = 'Appearance',
}: Props) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded px-2 py-1 font-mono text-[11px] tracking-[0.04em] text-[var(--muted)] hover:text-[var(--ink)] [&::-webkit-details-marker]:hidden">
        {label}
        <svg
          aria-hidden
          width="8"
          height="8"
          viewBox="0 0 8 8"
          className="transition-transform group-open:rotate-180"
        >
          <path d="M1 2.5 4 5.5 7 2.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </summary>

      <div
        className={`absolute right-0 z-50 min-w-[11rem] overflow-hidden rounded-md border border-[var(--rule)] bg-[var(--raised)] py-1.5 shadow-[var(--shadow)] ${
          align === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}
      >
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
