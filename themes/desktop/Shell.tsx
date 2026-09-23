import Link from 'next/link'
import type { NavLink } from '@/lib/theme/contract'
import { Clock } from './Clock'
import { DocIcon, FolderIcon, GridIcon, LinkIcon, MailIcon, PdfIcon, PersonIcon } from './icons'

/**
 * A desktop: menu bar, wallpaper, icons, windows, dock.
 *
 * The constraint that shapes all of it: every icon and dock item is a real
 * <a href> to a real URL, and window content is in the server HTML before any
 * JavaScript runs. Google only discovers anchors, and it will not load content
 * that appears on click. So this is an OS metaphor drawn over a genuinely
 * navigable site, not an app that paints content in.
 *
 * What is deliberately NOT copied: traffic-light buttons and pixel-accurate
 * chrome. Realistic chrome creates false affordances. On a well-known
 * macOS-simulation portfolio, visitors pressed Cmd+W expecting to close a fake
 * window and closed their actual browser tab.
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

const APPS: NavLink[] = [
  { href: '/work', label: 'Projects' },
  { href: '/blog', label: 'Writing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

function isActive(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`)
}

/** `/work/devnest` reads as `~/work/devnest` in a title bar. */
function asPath(path: string) {
  return path === '/' ? '~' : `~${path}`
}

function DesktopIcon({ file }: { file: DesktopFile }) {
  const Icon = file.icon
  const content = (
    <>
      <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--raised)]/60 text-[var(--ink)] ring-1 ring-[var(--rule)] transition-all group-hover:bg-[var(--selection)] group-hover:text-[var(--accent)] group-hover:ring-[var(--accent)]">
        <Icon className="h-7 w-7" />
      </span>
      <span className="max-w-[5.5rem] rounded px-1.5 py-0.5 text-center text-[11px] leading-tight text-[var(--ink)] group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-contrast)]">
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
  location,
}: {
  children: React.ReactNode
  nav: NavLink[]
  siteName: string
  path: string
  appearance?: React.ReactNode
  headline?: string
  location?: string
}) {
  const onDesktop = path === '/'
  const openApp = APPS.find((t) => isActive(path, t.href))

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[var(--ground)]">
      {/* Wallpaper. A gradient wash rather than a photo, so it stays legible in
          both modes and costs nothing to load. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(110% 80% at 80% 0%, var(--selection) 0%, transparent 55%), radial-gradient(90% 70% at 8% 100%, var(--selection) 0%, transparent 50%)',
        }}
      />

      {/* Menu bar. The single strongest signal that this is an OS rather than a
          website in a box. */}
      <div className="relative z-30 flex h-8 shrink-0 items-center justify-between gap-4 border-b border-[var(--rule)] bg-[var(--chrome)]/85 px-3 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-4 font-mono text-[11px]">
          <Link
            href="/"
            className="shrink-0 font-semibold text-[var(--ink)] hover:text-[var(--accent)]"
          >
            {siteName}
          </Link>
          <span className="hidden truncate text-[var(--muted)] sm:inline">
            {openApp?.label ?? 'Desktop'}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-[var(--muted)]">
          {location && <span className="hidden sm:inline">{location}</span>}
          <Clock />
        </div>
      </div>

      {/* Identity on the wallpaper. Stays visible behind an open window so the
          person never disappears behind the interface, which is the most common
          failure of this genre. */}
      {headline && (
        <div className="relative z-0 shrink-0 px-6 pt-7 sm:px-10">
          <h2 className="max-w-[24ch] text-xl font-medium leading-snug tracking-[-0.02em] text-[var(--ink)] sm:text-2xl">
            {headline}
          </h2>
        </div>
      )}

      {/* Desktop surface. min-h-0 is what lets these children scroll rather
          than overflow: a flex item will not shrink below its content without
          it, and the h-screen parent then clips the bottom. */}
      <div className="relative z-0 flex min-h-0 flex-1 flex-col gap-6 px-6 pb-24 pt-6 sm:flex-row sm:px-10">
        <div className="flex shrink-0 flex-wrap content-start gap-x-2 gap-y-4 sm:max-w-[7rem] sm:flex-col sm:flex-nowrap sm:overflow-y-auto">
          {FILES.map((file) => (
            <DesktopIcon key={file.href} file={file} />
          ))}
        </div>

        {onDesktop && <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>}
      </div>

      {/* Window layer. */}
      {!onDesktop && (
        <div className="pointer-events-none absolute inset-x-0 bottom-20 top-24 z-10 flex justify-center px-3 sm:px-6">
          <div className="pointer-events-auto flex w-full max-w-[58rem] flex-col overflow-hidden rounded-lg border border-[var(--rule)] bg-[var(--window)] shadow-[var(--shadow)] sm:ml-[7rem]">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--rule)] bg-[var(--chrome)] px-3.5 py-2">
              <span className="flex min-w-0 items-center gap-2 font-mono text-[11px] text-[var(--muted)]">
                <DocIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{asPath(path)}</span>
              </span>
              <Link
                href="/"
                aria-label="Close window"
                className="shrink-0 rounded border border-[var(--rule)] px-2 py-0.5 font-mono text-[11px] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                close
              </Link>
            </div>

            <div id="content" className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-9">
              {children}
            </div>

            {/* Status strip, the way a file browser reports where you are. */}
            <div className="flex shrink-0 items-center justify-between border-t border-[var(--rule)] bg-[var(--chrome)] px-3.5 py-1.5 font-mono text-[10px] text-[var(--faint)]">
              <span>{openApp?.label ?? 'Window'}</span>
              <span>{siteName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Dock: a centred floating pill. The scrolling region is the app list
          ALONE, because an ancestor with overflow clips any child that extends
          past its box, which was cutting off the settings menu. */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-4">
        <div className="flex max-w-full items-center gap-1 rounded-xl border border-[var(--rule)] bg-[var(--chrome)]/90 px-2 py-1.5 shadow-[var(--shadow)] backdrop-blur-md">
          <nav aria-label="Applications" className="flex min-w-0 items-center gap-1 overflow-x-auto">
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

            {APPS.map((item) => {
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
