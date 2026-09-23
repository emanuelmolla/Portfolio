import Link from 'next/link'
import type { ReactNode } from 'react'
import { hasDatabase } from '@/lib/content/_util'
import { requireAdmin } from '@/lib/admin/session'
import { readCounts } from '@/lib/admin/read'
import { Nav, type NavItem } from '@/components/admin/Nav'
import { signOutAction } from '../actions'

/**
 * The gate, and the shell around every real admin screen.
 *
 * A route group rather than a path segment, so /admin/work is still /admin/work
 * and the login page can live outside this layout without being at a URL like
 * /admin/public/login.
 *
 * force-dynamic because an editing surface must never be served from a cache.
 * Everything here is either per-request identity or the current state of the
 * database, and both are wrong the moment they are a second old.
 *
 * Worth being explicit about the limit of this gate: it protects what RENDERS.
 * Server actions are separately addressable POST endpoints that do not run this
 * layout, so each one calls guard() itself. See lib/admin/session.ts.
 */

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin()
  const counts = await readCounts()

  const items: NavItem[] = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/messages', label: 'Messages', badge: counts.unread },
    { href: '/admin/posts', label: 'Writing' },
    { href: '/admin/work', label: 'Work' },
    { href: '/admin/experience', label: 'Experience' },
    { href: '/admin/tech', label: 'Tech' },
    { href: '/admin/pages', label: 'Pages' },
    { href: '/admin/profile', label: 'Profile' },
    { href: '/admin/resume', label: 'Resume' },
    { href: '/admin/redirects', label: 'Redirects' },
  ]

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8 lg:py-8">
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <Link href="/admin" className="text-[14px] font-semibold tracking-tight">
            Admin
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="a-hint hover:text-[var(--a-ink)]"
          >
            View site
          </Link>
        </div>

        <Nav items={items} />

        <div className="mt-5 border-t border-[var(--a-line)] pt-4">
          <p className="a-hint truncate" title={admin.email}>
            {admin.email}
          </p>
          <form action={signOutAction} className="mt-2">
            <button type="submit" className="a-btn a-btn-sm a-btn-ghost">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0">
        {/* Shown on every screen, not just the dashboard: without a connection
            string every list is empty and every save fails, and discovering that
            one form submission at a time is worse than being told once. */}
        {!hasDatabase() && (
          <div className="a-notice a-notice-warn mb-5">
            <p className="font-medium">No database is connected.</p>
            <p className="mt-2">
              The site is running off the seed content in{' '}
              <code className="a-mono">lib/content/_seed.ts</code>. Every list here is empty and
              nothing can be saved until <code className="a-mono">MONGODB_URI</code> is set in{' '}
              <code className="a-mono">.env.local</code>. After that, run{' '}
              <code className="a-mono">npm run seed</code> to write the current content into it.
            </p>
          </div>
        )}

        {children}
      </main>
    </div>
  )
}
