import Link from 'next/link'
import { ThemedPage } from '@/components/ThemedPage'

/**
 * Rendered inside the active theme's chrome, so a 404 still has the nav, the
 * dock, and a way out. A bare 404 that drops the site's furniture reads like
 * the server fell over rather than like a wrong address.
 */
export default function NotFound() {
  return (
    <ThemedPage path="/404">
      <div className="pt-24 pb-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--faint)]">
          404
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
          This page does not exist.
        </h1>
        <p className="mt-5 max-w-[34rem] leading-relaxed text-[var(--muted)]">
          It may have moved. Renamed pages keep their old URLs working, so if you followed a
          link and landed here, something is genuinely wrong and it is worth telling me.
        </p>
        <div className="mt-9 flex flex-wrap gap-6 font-mono text-xs">
          <Link href="/" className="text-[var(--muted)] hover:text-[var(--accent)]">
            home
          </Link>
          <Link href="/work" className="text-[var(--muted)] hover:text-[var(--accent)]">
            work
          </Link>
          <Link href="/contact" className="text-[var(--muted)] hover:text-[var(--accent)]">
            contact
          </Link>
        </div>
      </div>
    </ThemedPage>
  )
}
