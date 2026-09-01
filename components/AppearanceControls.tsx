import { themes } from '@/themes/registry'
import type { ColorScheme } from '@/lib/theme/resolve'

/**
 * Theme and colour-scheme switchers.
 *
 * Server component, plain anchors, no client JS. Each link hits the appearance
 * route handler which sets a cookie and redirects back to `path`.
 *
 * Shared across themes on purpose: a visitor must be able to leave the desktop
 * theme from inside the desktop theme, so this cannot live in a theme folder.
 * It takes no styling opinions beyond the tokens, so each theme's chrome
 * absorbs it.
 */

interface Props {
  path: string
  currentTheme: string
  currentScheme: ColorScheme
}

const SCHEMES: { value: ColorScheme; label: string }[] = [
  { value: 'light', label: 'light' },
  { value: 'dark', label: 'dark' },
  { value: 'system', label: 'auto' },
]

function href(params: Record<string, string>, path: string) {
  const qs = new URLSearchParams({ ...params, from: path })
  return `/api/appearance?${qs.toString()}`
}

export function AppearanceControls({ path, currentTheme, currentScheme }: Props) {
  const themeList = Object.values(themes)

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] tracking-wide">
      <div className="flex items-center gap-2">
        <span className="text-[var(--faint)]">theme</span>
        {themeList.map((t) => {
          const active = t.id === currentTheme
          return (
            <a
              key={t.id}
              href={href({ theme: t.id }, path)}
              aria-current={active ? 'true' : undefined}
              className={
                active
                  ? 'text-[var(--ink)] underline underline-offset-4'
                  : 'text-[var(--muted)] hover:text-[var(--accent)]'
              }
            >
              {t.id}
            </a>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[var(--faint)]">mode</span>
        {SCHEMES.map((s) => {
          const active = s.value === currentScheme
          return (
            <a
              key={s.value}
              href={href({ scheme: s.value }, path)}
              aria-current={active ? 'true' : undefined}
              className={
                active
                  ? 'text-[var(--ink)] underline underline-offset-4'
                  : 'text-[var(--muted)] hover:text-[var(--accent)]'
              }
            >
              {s.label}
            </a>
          )
        })}
      </div>
    </div>
  )
}
