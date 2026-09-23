'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Admin navigation.
 *
 * A client component only because the active item depends on the current path.
 * Everything else about the shell stays on the server.
 *
 * Matching is prefix-based except for the dashboard, which has to be exact: '/admin'
 * is a prefix of every other admin URL, so a plain startsWith would light up the
 * dashboard on every screen.
 */

export interface NavItem {
  href: string
  label: string
  badge?: number
}

export function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin sections">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)

          return (
            <li key={item.href} className="shrink-0 lg:shrink">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center justify-between gap-2 rounded px-2.5 py-1.5 text-[13px] whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[var(--a-accent-soft)] font-medium text-[var(--a-accent)]'
                    : 'text-[var(--a-muted)] hover:bg-[var(--a-panel-2)] hover:text-[var(--a-ink)]'
                }`}
              >
                <span>{item.label}</span>
                {/* Only drawn when there is something to report. A badge reading
                    "0" is a notification that nothing happened. */}
                {item.badge ? (
                  <span className="a-badge a-badge-unread">{item.badge}</span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
