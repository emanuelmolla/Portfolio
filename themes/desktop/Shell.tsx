import Link from 'next/link'
import type { NavLink, ShellLink } from '@/lib/theme/contract'
import { resumeFilename } from '@/lib/resume'
import { Clock } from './Clock'
import {
  FolderIcon,
  DocIcon,
  GridIcon,
  MailIcon,
  PdfIcon,
  PersonIcon,
} from './icons'
import './desktop.css'
import { DesktopSession, DesktopWindow } from './Window'
import { StickyNotes } from './StickyNotes'

const apps = [
  { href: '/work', label: 'Projects', icon: FolderIcon },
  { href: '/blog', label: 'Writing', icon: DocIcon },
  { href: '/about', label: 'About', icon: PersonIcon },
  { href: '/experience', label: 'Experience', icon: FolderIcon },
  { href: '/contact', label: 'Mail', icon: MailIcon },
]
const active = (path: string, href: string) =>
  path === href || (href !== '/' && path.startsWith(`${href}/`))

export function Shell({
  children,
  nav,
  siteName,
  path,
  headline,
  location,
  resumeUrl = '/resume',
}: {
  children: React.ReactNode
  nav: NavLink[]
  siteName: string
  path: string
  appearance?: React.ReactNode
  headline?: string
  location?: string
  resumeUrl?: string
  links?: ShellLink[]
}) {
  const app = apps.find((item) => active(path, item.href))
  const segments = path.split('/').filter(Boolean)
  const filename = resumeFilename(siteName)
  const pages = nav.filter(
    (item) => !apps.some((app) => app.href === item.href)
  )
  return (
    <DesktopSession key={path} path={path}>
      <a
        href={path === '/' ? '#desktop-workspace' : '#content'}
        className="desktop-skip-link"
      >
        Skip to content
      </a>
      <header className="desktop-menubar">
        <Link href="/" data-desktop-surface>
          {siteName}
        </Link>
        <span>{path === '/' ? 'Desktop' : (app?.label ?? 'Document')}</span>
        <div>
          {location && <span>{location}</span>}
          <Clock />
        </div>
      </header>
      <StickyNotes
        siteName={siteName}
        headline={headline}
        resumeUrl={resumeUrl}
        filename={filename}
      />
      <div
        className="desktop-workspace"
        id="desktop-workspace"
        tabIndex={-1}
        role={path === '/' ? 'main' : undefined}
      >
        <nav className="desktop-shortcuts" aria-label="Desktop files">
          {apps.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(path, href) ? 'page' : undefined}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
          <a href={resumeUrl} download={filename}>
            <PdfIcon />
            <span>{filename}</span>
          </a>
        </nav>
        <div className="desktop-stage">
          <div className="desktop-identity">
            {path === '/' ? <h1>{siteName}</h1> : <strong>{siteName}</strong>}
            {headline && <span>{headline}</span>}
          </div>
          {path !== '/' && (
            <DesktopWindow title={app?.label ?? 'Document'}>
              <nav className="desktop-address" aria-label="File location">
                <Link
                  href={
                    segments.length > 1
                      ? `/${segments.slice(0, -1).join('/')}`
                      : '/'
                  }
                  aria-label="Parent folder"
                  data-desktop-surface={segments.length <= 1 ? '' : undefined}
                >
                  ↑
                </Link>
                <ol>
                  <li>
                    <Link href="/" data-desktop-surface>
                      Desktop
                    </Link>
                  </li>
                  {segments.map((segment, index) => (
                    <li key={index}>
                      <span aria-hidden>›</span>
                      {index === segments.length - 1 ? (
                        <span aria-current="page">
                          {apps.find((a) => a.href === `/${segment}`)?.label ??
                            segment}
                        </span>
                      ) : (
                        <Link
                          href={`/${segments.slice(0, index + 1).join('/')}`}
                        >
                          {apps.find((a) => a.href === `/${segment}`)?.label ??
                            segment}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="desktop-window-body">
                <aside className="desktop-sidebar">
                  <p>Folders</p>
                  <nav aria-label="Explorer folders">
                    <Link href="/" data-desktop-surface>
                      <GridIcon />
                      Desktop
                    </Link>
                    {apps.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        aria-current={active(path, href) ? 'page' : undefined}
                      >
                        <Icon />
                        {label}
                      </Link>
                    ))}
                  </nav>
                  {pages.length > 0 && (
                    <>
                      <p>Pages</p>
                      <nav aria-label="Pages">
                        {pages.map((page) => (
                          <Link
                            key={page.href}
                            href={page.href}
                            aria-current={
                              active(path, page.href) ? 'page' : undefined
                            }
                          >
                            <DocIcon />
                            {page.label}
                          </Link>
                        ))}
                      </nav>
                    </>
                  )}
                  <p>Documents</p>
                  <a href={resumeUrl} download={filename}>
                    <PdfIcon />
                    Resume.pdf
                  </a>
                  <small>
                    {siteName}
                    <br />
                    Personal portfolio
                  </small>
                </aside>
                <main id="content" tabIndex={-1} className="desktop-content">
                  {children}
                </main>
              </div>
              <footer className="desktop-status">
                <span>
                  Desktop{segments.length ? ` / ${segments.join(' / ')}` : ''}
                </span>
                <span>Portfolio</span>
              </footer>
            </DesktopWindow>
          )}
        </div>
      </div>
      <div className="desktop-taskbar">
        <nav aria-label="Applications">
          <Link href="/" data-desktop-surface title="Desktop">
            <GridIcon />
            <span>Desktop</span>
          </Link>
          {apps.map(({ href, label, icon: Icon }) => (
            <Link
              href={href}
              key={href}
              aria-current={active(path, href) ? 'page' : undefined}
              title={label}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
          <a href={resumeUrl} download={filename} title="Download resume">
            <PdfIcon />
            <span>Resume</span>
          </a>
        </nav>
      </div>
    </DesktopSession>
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
    <section className="desktop-section">
      <h2>{label}</h2>
      {children}
    </section>
  )
}
