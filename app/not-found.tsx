import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[60rem] flex-col justify-center px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--faint)]">404</p>
      <h1 className="mt-4 text-3xl font-medium tracking-[-0.03em]">This page does not exist.</h1>
      <p className="mt-4 max-w-[34rem] leading-relaxed text-[var(--muted)]">
        It may have moved. Renamed pages keep their old URLs working, so if you followed a
        link from somewhere and landed here, something is genuinely wrong and it is worth
        telling me.
      </p>
      <div className="mt-8 flex gap-6 font-mono text-xs">
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
  )
}
