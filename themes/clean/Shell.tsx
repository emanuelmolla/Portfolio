import Link from 'next/link'
import type { NavLink } from '@/lib/theme/contract'

/**
 * Chrome for every page in the clean theme.
 *
 * Left-aligned, single column, generous vertical rhythm. No hero banner, no
 * call-to-action button, no card grid. The structural bet is that a portfolio
 * whose work is mostly backend should read like a well-set index rather than a
 * product landing page: there are no screenshots worth showing for an API, so
 * typography carries it.
 */
export function Shell({
  children,
  nav,
  siteName,
  appearance,
}: {
  children: React.ReactNode
  nav: NavLink[]
  siteName: string
  path?: string
  appearance?: React.ReactNode
}) {
  return (
    <div className="min-h-screen px-6">
      <div className="mx-auto flex min-h-screen max-w-[60rem] flex-col">
        <header className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 pt-20">
          <Link
            href="/"
            className="text-[13px] font-semibold tracking-[0.02em] text-[var(--muted)] hover:text-[var(--accent)]"
          >
            {siteName}
          </Link>

          <nav aria-label="Primary">
            <ul className="flex flex-wrap gap-6 font-mono text-xs tracking-[0.04em]">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[var(--muted)] hover:text-[var(--accent)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-24 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-[var(--rule)] py-10 font-mono text-[11px] text-[var(--faint)]">
          <span>Surrey, BC</span>
          {appearance}
        </footer>
      </div>
    </div>
  )
}

/**
 * Section heading. A single hairline under a small-caps mono label, and nothing
 * else: dense hairline rules between every row is a broadsheet pastiche that
 * currently reads as machine-generated, so rows below are separated by space.
 */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-10 border-b border-[var(--rule)] pb-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--faint)]">
      {children}
    </h2>
  )
}
