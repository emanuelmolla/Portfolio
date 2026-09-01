import Link from 'next/link'
import type { NavLink } from '@/lib/theme/contract'

/**
 * Desktop chrome: a dock along the bottom, content in a window above it.
 *
 * What survives from v1: the dock, the window metaphor, the dark character,
 * and the amber the old site used for the active item, which was a real choice
 * rather than a default.
 *
 * What changed, and why:
 *  - Every dock item is a real <a href> to a real URL. Google only discovers
 *    links that are anchors, and the v1 dock was <button onClick={navigate}>.
 *  - Window content is server-rendered before any JS. Google will not load
 *    content that appears on click, which is exactly what v1 did.
 *  - The animated fire-gradient border is gone. It was the loudest thing on
 *    the old page and it fought everything else for attention.
 *  - No fake traffic-light buttons. Realistic OS chrome creates false
 *    affordances: on a well-known macOS-simulation portfolio, visitors hit
 *    Cmd+W expecting to close a fake window and closed their actual browser
 *    tab. The close control here is a labelled link home.
 *  - The name and headline sit on the desktop itself, always visible behind
 *    the window. The single strongest criticism of this genre is "I played
 *    with it for a few minutes and never saw his work or who made it".
 */

const DOCK: NavLink[] = [
  { href: '/work', label: 'Work' },
  { href: '/blog', label: 'Writing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

function isActive(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`)
}

export function Shell({
  children,
  siteName,
  path,
  appearance,
  headline,
}: {
  children: React.ReactNode
  nav: NavLink[]
  siteName: string
  path: string
  appearance?: React.ReactNode
  headline?: string
}) {
  const onDesktop = path === '/'

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* The desktop itself. Always present, always readable behind the window. */}
      <div className="pointer-events-none absolute inset-0 flex items-start px-6 pt-20 sm:px-10">
        <div className="mx-auto w-full max-w-[60rem]">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">
            {siteName}
          </p>
          {headline && (
            <h2
              className={`mt-3 max-w-[20ch] text-2xl font-medium leading-tight tracking-[-0.02em] sm:text-3xl ${
                onDesktop ? 'text-[var(--ink)]' : 'text-[var(--faint)]'
              }`}
            >
              {headline}
            </h2>
          )}
        </div>
      </div>

      {/* The window. On the home route there is no window: the desktop is the page. */}
      <main className="relative z-10 flex flex-1 items-stretch px-3 pb-28 pt-6 sm:px-6 sm:pb-32 sm:pt-10">
        {onDesktop ? (
          <div className="mx-auto w-full max-w-[60rem] self-end pb-6">{children}</div>
        ) : (
          <div className="mx-auto flex w-full max-w-[62rem] flex-col overflow-hidden rounded-lg border border-[var(--rule)] bg-[var(--window)] shadow-[var(--shadow)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--rule)] bg-[var(--chrome)] px-4 py-2.5">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                {DOCK.find((d) => isActive(path, d.href))?.label ?? 'Window'}
              </span>
              <Link
                href="/"
                className="rounded-sm px-2 py-1 font-mono text-[11px] text-[var(--muted)] transition-colors hover:bg-[var(--selection)] hover:text-[var(--accent)]"
              >
                close
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-2 sm:px-10">{children}</div>
          </div>
        )}
      </main>

      {/* The dock. Real links, keyboard reachable, active state from the URL. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-4"
      >
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-[var(--rule)] bg-[var(--chrome)]/90 px-2 py-1.5 shadow-[var(--shadow)] backdrop-blur-md">
          {DOCK.map((item) => {
            const active = isActive(path, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-lg px-3.5 py-2 font-mono text-xs tracking-[0.03em] transition-colors ${
                  active
                    ? 'bg-[var(--selection)] text-[var(--accent)]'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
              >
                {item.label.toLowerCase()}
              </Link>
            )
          })}

          <span aria-hidden className="mx-1 h-5 w-px bg-[var(--rule)]" />

          <Link
            href="/"
            aria-current={onDesktop ? 'page' : undefined}
            className={`rounded-lg px-3.5 py-2 font-mono text-xs tracking-[0.03em] transition-colors ${
              onDesktop
                ? 'bg-[var(--selection)] text-[var(--accent)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            home
          </Link>
        </div>
      </nav>

      {appearance && (
        <div className="fixed bottom-4 right-4 z-20 hidden lg:block">{appearance}</div>
      )}
    </div>
  )
}

export function WindowSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="pb-14">
      <h2 className="mb-8 border-b border-[var(--rule)] pb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--faint)]">
        {label}
      </h2>
      {children}
    </section>
  )
}
