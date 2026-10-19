import Link from 'next/link'
import Image from 'next/image'
import type { ThemeModule } from '@/lib/theme/contract'
import { GameFrame, GameHud } from './GameFrame'
import { RoomScene } from './RoomScene'
import './chess.css'

export const Shell: ThemeModule['Shell'] = ({
  children,
  nav,
  siteName,
  path,
  headline,
  location,
  resumeUrl,
  links,
}) => (
  <GameFrame>
    <a className="chess-skip" href="#chess-content">
      Skip to content
    </a>
    <header className="chess-masthead">
      <Link href="/" className="chess-brand" aria-label={`${siteName}, home`}>
        <span className="chess-seal" aria-hidden="true">
          ♞
        </span>
        <span>
          {siteName}
          <small>
            {headline || 'Portfolio'}
            {location ? ` / ${location}` : ''}
          </small>
        </span>
      </Link>
      <nav aria-label="Main navigation" className="chess-nav">
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={
              path === href || path.startsWith(`${href}/`) ? 'page' : undefined
            }
          >
            <span className="chess-nav-medallion" aria-hidden="true">
              <Image
                className="chess-nav-token"
                src={`/themes/chess/pieces/white-${({ '/work': 'rook', '/blog': 'bishop', '/about': 'knight', '/contact': 'pawn' } as Record<string, string>)[href] || 'queen'}.svg`}
                width={28}
                height={28}
                alt=""
                unoptimized
              />
            </span>
            <span className="chess-nav-label">{label}</span>
          </Link>
        ))}
      </nav>
      {resumeUrl && (
        <a className="chess-resume" href={resumeUrl}>
          Résumé <span aria-hidden="true">↗</span>
        </a>
      )}
    </header>
    <GameHud
      section={
        nav.find(
          (item) => path === item.href || path.startsWith(`${item.href}/`),
        )?.label ||
        (path === '/'
          ? 'Home'
          : path === '/experience'
            ? 'Experience'
            : 'Portfolio')
      }
    />
    <RoomScene path={path}>{children}</RoomScene>
    <footer className="chess-footer">
      <Link href="/">{siteName}</Link>
      <span>A different view. The same work.</span>
      <div>
        {links
          ?.filter((l) => ['github', 'linkedin'].includes(l.kind))
          .map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
              {l.label || l.kind} ↗
            </a>
          ))}
      </div>
    </footer>
  </GameFrame>
)
