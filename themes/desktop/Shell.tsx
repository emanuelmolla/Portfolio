import Link from 'next/link'
import type { NavLink } from '@/lib/theme/contract'
import { Clock } from './Clock'
import { DocIcon, FolderIcon, GridIcon, LinkIcon, MailIcon, PdfIcon, PersonIcon } from './icons'

/**
 * A desktop: wallpaper, icons you can open, a taskbar, and windows.
 *
 * The constraint that shapes all of it: every icon and every taskbar button is
 * a real <a href> to a real URL, and window content is in the server HTML
 * before any JavaScript runs. Google only discovers anchors, and it will not
 * load content that appears on click. So this is an OS metaphor rendered over
 * a genuinely navigable site, rather than an app that paints content in.
 *
 * What is deliberately NOT copied from a real OS: traffic-light buttons and
 * pixel-accurate chrome. Realistic chrome creates false affordances. On a
 * well-known macOS-simulation portfolio, visitors pressed Cmd+W expecting to
 * close a fake window and closed their actual browser tab.
 */

interface DesktopFile {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
  download?: boolean
}

const FILES: DesktopFile[] = [
  { href: '/work', label: 'Projects', icon: FolderIcon },
  { href: '/blog', label: 'Writing', icon: FolderIcon },
  { href: '/about', label: 'About me', icon: PersonIcon },
  { href: '/contact', label: 'Contact', icon: MailIcon },
  { href: '/resume.pdf', label: 'Resume.pdf', icon: PdfIcon, external: true, download: true },
  { href: 'https://github.com/emanuelmolla', label: 'GitHub', icon: LinkIcon, external: true },
]

const TASKBAR: NavLink[] = [
  { href: '/work', label: 'Projects' },
  { href: '/blog', label: 'Writing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

function isActive(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`)
}

function DesktopIcon({ file }: { file: DesktopFile }) {
  const Icon = file.icon
  const content = (
    <>
      <span className="flex h-14 w-14 items-center justify-center rounded-md bg-[var(--chrome)]/70 text-[var(--ink)] ring-1 ring-[var(--rule)] transition-colors group-hover:bg-[var(--selection)] group-hover:text-[var(--accent)] group-hover:ring-[var(--accent)]">
        <Icon className="h-7 w-7" />
      </span>
      <span className="max-w-[5.5rem] rounded px-1 py-0.5 text-center text-[11px] leading-tight text-[var(--ink)] group-hover:bg-[var(--selection)]">
        {file.label}
      </span>
    </>
  )

  const cls =
    'group flex w-[5.75rem] flex-col items-center gap-1.5 rounded p-1 focus-visible:outline-2 focus-visible:outline-[var(--accent)]'

  if (file.external) {
    return (
      <a
        href={file.href}
        className={cls}
        target={file.download ? undefined : '_blank'}
        rel="noreferrer noopener"
        download={file.download}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={file.href} className={cls}>
      {content}
    </Link>
  )
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
  const openApp = TASKBAR.find((t) => isActive(path, t.href))

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* Wallpaper. A soft radial wash off the accent rather than a photo, so
          it stays legible in both modes and adds no weight. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 78% 8%, var(--selection) 0%, transparent 58%), radial-gradient(90% 70% at 12% 95%, var(--selection) 0%, transparent 55%)',
        }}
      />

      {/* Identity. Stays visible behind an open window, so the person never
          disappears behind the interface: the single most common failure of
          this genre. */}
      <div className="relative z-0 shrink-0 px-6 pt-8 sm:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">
          {siteName}
        </p>
        {headline && (
          <h2 className="mt-2 max-w-[24ch] text-xl font-medium leading-snug tracking-[-0.02em] text-[var(--ink)] sm:text-2xl">
            {headline}
          </h2>
        )}
      </div>

      {/*
        The desktop surface. min-h-0 on a flex child is what lets its children
        scroll instead of overflowing: without it a flex item refuses to shrink
        below its content and the bottom simply gets clipped by the h-screen
        parent, which is what was cutting the work panel in half.
      */}
      <div className="relative z-0 flex min-h-0 flex-1 flex-col gap-6 px-6 pb-20 pt-6 sm:flex-row sm:px-10">
        <div className="flex shrink-0 flex-wrap content-start gap-x-2 gap-y-4 sm:max-w-[7rem] sm:flex-col sm:flex-nowrap sm:overflow-y-auto">
          {FILES.map((file) => (
            <DesktopIcon key={file.href} file={file} />
          ))}
        </div>

        {onDesktop && (
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        )}
      </div>

      {/* Window layer, drawn over the desktop. */}
      {!onDesktop && (
        <div className="pointer-events-none absolute inset-x-0 bottom-20 top-28 z-10 flex justify-center px-3 sm:px-6">
          <div className="pointer-events-auto flex w-full max-w-[58rem] flex-col overflow-hidden rounded-lg border border-[var(--rule)] bg-[var(--window)] shadow-[var(--shadow)] sm:ml-[7rem]">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--rule)] bg-[var(--chrome)] px-4 py-2.5">
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                <DocIcon className="h-3.5 w-3.5" />
                {openApp?.label ?? 'Window'}
              </span>
              <Link
                href="/"
                aria-label="Close window"
                className="rounded px-2.5 py-1 font-mono text-[11px] text-[var(--muted)] transition-colors hover:bg-[var(--selection)] hover:text-[var(--accent)]"
              >
                close
              </Link>
            </div>
            <div id="content" className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-9">
              {children}
            </div>
          </div>
        </div>
      )}

      {/* Clock in the top-right corner rather than the dock. A centred dock has
          no natural edge to pin a tray to, and the menu-bar corner is where a
          clock is looked for on a desktop anyway. */}
      <div className="absolute right-6 top-8 z-20 sm:right-10">
        <Clock />
      </div>

      {/* The dock: a centred floating pill, not a full-width bar.
          The scrolling region is the app list ALONE. The settings menu sits
          outside it: an ancestor with overflow-x-auto clips any child that
          extends past its box, which is what was cutting the open menu off. */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-4">
        <div className="flex max-w-full items-center gap-1 rounded-xl border border-[var(--rule)] bg-[var(--chrome)]/90 px-2 py-1.5 shadow-[var(--shadow)] backdrop-blur-md">
        <nav
          aria-label="Applications"
          className="flex min-w-0 items-center gap-1 overflow-x-auto"
        >
          <Link
            href="/"
            aria-label="Desktop"
            aria-current={onDesktop ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-mono text-[11px] tracking-[0.04em] transition-colors ${
              onDesktop
                ? 'bg-[var(--selection)] text-[var(--accent)]'
                : 'text-[var(--muted)] hover:bg-[var(--selection)] hover:text-[var(--ink)]'
            }`}
          >
            <GridIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </Link>

          <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-[var(--rule)]" />

          {TASKBAR.map((item) => {
            const active = isActive(path, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 rounded-lg px-3.5 py-2 text-[12px] transition-colors ${
                  active
                    ? 'bg-[var(--selection)] text-[var(--accent)] shadow-[inset_0_-2px_0_var(--accent)]'
                    : 'text-[var(--muted)] hover:bg-[var(--selection)] hover:text-[var(--ink)]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}

        </nav>

          <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-[var(--rule)]" />

          <div className="shrink-0">{appearance}</div>
        </div>
      </div>
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
    <section className="pb-12">
      <h2 className="mb-6 border-b border-[var(--rule)] pb-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--faint)]">
        {label}
      </h2>
      {children}
    </section>
  )
}
