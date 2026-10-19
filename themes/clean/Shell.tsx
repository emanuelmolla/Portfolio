import Link from 'next/link'
import type { NavLink } from '@/lib/theme/contract'
import './clean.css'

/**
 * Chrome for every page in the clean theme.
 *
 * A left-aligned reading column with a compact masthead. Typography establishes
 * hierarchy while real project screenshots provide evidence of the work.
 */
export function Shell({
  children,
  nav,
  siteName,
  location,
  path = '/',
}: {
  children: React.ReactNode
  nav: NavLink[]
  siteName: string
  path?: string
  appearance?: React.ReactNode
  location?: string
}) {
  return (
    <div className="clean-shell min-h-screen px-6">
      {/* Keyboard users land here first. Hidden until focused, then it appears
          in the corner. Every page starts with the same masthead and nav, so
          without this a keyboard visitor tabs through the same links on every
          single page before reaching the content. */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:border focus:border-[var(--rule)] focus:bg-[var(--raised)] focus:px-3 focus:py-2 focus:font-mono focus:text-xs"
      >
        Skip to content
      </a>

      <div className="mx-auto flex min-h-screen max-w-[60rem] flex-col">
        {/*
          Sticky, because on a long project page the only way back to the rest of
          the site was to scroll to the top first.

          A sticky element always renders its own padding, so the tall pt-20 this
          used to carry would have parked a seven-rem bar across the viewport for
          the whole scroll. There is no CSS-only way to be tall at rest and short
          when stuck without scroll-driven animations, which Safari and Firefox do
          not support. So the header is compact at every scroll position, and the
          air that used to sit above it now belongs to the page: every view
          already opens with its own pt-20 or pt-24.

          An opaque ground keeps scrolling text from showing behind the header.
          z-40 sits below the appearance menu, which must stay reachable.

          Tighter padding below the sm breakpoint: the wordmark and the nav wrap
          onto two lines on a phone, and at the desktop padding that bar would
          take a sixth of the viewport for the whole scroll.
        */}
        <header className="clean-header sticky top-0 z-40 -mx-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-[var(--rule)] bg-[var(--ground)] px-6 py-3.5 sm:gap-x-8 sm:py-5">
          {/* The wordmark, not a nav item. Set in the display face so the one
              piece of identity in the header reads as a mark rather than as the
              first link in a list. Ink where the nav is muted, which is the whole
              hierarchy: this is whose site it is, those are its sections. */}
          <Link
            href="/"
            className="wordmark text-[15px] text-[var(--ink)] hover:text-[var(--accent)]"
          >
            {siteName}
          </Link>

          <nav aria-label="Primary">
            <ul className="clean-nav flex flex-wrap">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={
                      path === item.href
                        ? 'page'
                        : item.href !== '/' && path.startsWith(`${item.href}/`)
                          ? 'location'
                          : undefined
                    }
                    className="clean-nav-link"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main id="content" tabIndex={-1} className="flex-1">
          {children}
        </main>

        <footer className="mt-24 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-[var(--rule)] py-10 font-mono text-[11px] text-[var(--faint)]">
          <span>{location ?? 'Vancouver'}</span>
          <span>{new Date().getFullYear()}</span>
        </footer>
      </div>
    </div>
  )
}

/** Index titles use h1; sections use h2 with a quieter scale. */
export function SectionLabel({
  children,
  as: Tag = 'h2',
}: {
  children: React.ReactNode
  as?: 'h1' | 'h2'
}) {
  return <Tag className="clean-section-label">{children}</Tag>
}
