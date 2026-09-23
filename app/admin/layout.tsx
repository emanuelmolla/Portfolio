import type { Metadata } from 'next'
import type { ReactNode } from 'react'

/**
 * The outermost admin layer.
 *
 * It holds no authentication check, deliberately: the login page is a child of
 * this route and gating here would lock the visitor out of the only screen that
 * can let them in. The gate lives one level down in the (app) route group, which
 * every real admin screen sits inside.
 *
 * The .admin class switches the whole subtree onto its own --a-* tokens, so the
 * editing surface does not restyle itself when the site theme cookie changes.
 */

export const metadata: Metadata = {
  title: 'Admin',
  // robots.ts already disallows /admin, but a disallowed page is one a crawler
  // cannot read, so it can never see a noindex inside it. Both, because they
  // cover different failure modes: the first stops polite crawlers from
  // requesting it, the second stops anything that finds it anyway from listing it.
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="admin">{children}</div>
}
