import type { Metadata } from 'next'
import { Instrument_Sans, IBM_Plex_Mono } from 'next/font/google'
import { getProfile } from '@/lib/content'
import { resolveColorScheme, resolveTheme } from '@/lib/theme/resolve'
import './globals.css'

/*
  Typefaces, chosen rather than accepted:
  - Instrument Sans for text. A grotesque with slightly narrow proportions and
    real character in its italics. Deliberately not Inter, Geist or Space
    Grotesk, which read as "no typographic decision was made".
  - IBM Plex Mono for metadata, labels and code. Mono for data is honest for a
    backend portfolio, and Plex has more personality than the usual JetBrains.
*/
const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--app-font-sans',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--app-font-mono',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile()
  const name = profile?.name ?? 'Emanuel Molla'

  return {
    // A title template rather than a bare title, so every page reads
    // "DevNest — Emanuel Molla" without each route repeating the name.
    title: { default: name, template: `%s — ${name}` },
    description: profile?.seo?.description ?? profile?.bio?.short,
    metadataBase: new URL('https://emanuelmolla.dev'),
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: name,
      locale: 'en_CA',
    },
    robots: { index: true, follow: true },
  }
}

/**
 * Resolving the colour scheme without a flash.
 *
 * If the visitor has picked light or dark explicitly, the cookie tells us
 * server-side and the attribute is in the HTML from the first byte. If they are
 * on "system" we cannot know their OS preference on the server, so a tiny
 * blocking script sets the attribute before first paint. It runs once, reads
 * one media query, and touches nothing else.
 */
const schemeScript = `
(function(){try{
  var el=document.documentElement;
  if(el.getAttribute('data-scheme'))return;
  var dark=window.matchMedia('(prefers-color-scheme: dark)').matches;
  el.setAttribute('data-scheme',dark?'dark':'light');
}catch(e){}})();
`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, scheme] = await Promise.all([resolveTheme(), resolveColorScheme()])

  return (
    <html
      lang="en"
      data-theme={theme.id}
      // Omitted entirely when the preference is "system", which is the signal
      // the inline script waits for.
      data-scheme={scheme === 'system' ? undefined : scheme}
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: schemeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
