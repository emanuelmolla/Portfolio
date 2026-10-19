import assert from 'node:assert/strict'
import { seedWork, seedPosts } from '../lib/content/_seed'

// Run against a local seed-data server. No writes, submissions, or external URLs.
const base = new URL(process.argv[2] || 'http://localhost:3218')
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) {
  throw new Error('This check only runs against localhost.')
}
const routes = [
  '/',
  '/work',
  '/blog',
  '/about',
  '/contact',
  '/experience',
  ...seedWork
    .filter((item) => item.status === 'published')
    .map((item) => `/work/${item.slug}`),
  ...seedPosts
    .filter((item) => item.status === 'published')
    .map((item) => `/blog/${item.slug}`),
]
async function main() {
  let checked = 0
  for (const theme of ['clean', 'chess', 'terminal', 'desktop']) {
    const renderedTheme = theme === 'terminal' ? 'clean' : theme
    for (const route of routes) {
      const response = await fetch(new URL(route, base), {
        headers: { Cookie: `theme=${theme}; scheme=light` },
      })
      assert.equal(response.status, 200, `${theme} ${route}`)
      const html = await response.text()
      assert.match(
        html,
        new RegExp(`data-theme="${renderedTheme}"`),
        `${theme} ${route} theme`,
      )
      assert.match(
        html,
        /<h1[\s>]/,
        `${theme} ${route} server-rendered heading`,
      )
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
      assert.ok(canonical, `${theme} ${route} canonical is missing`)
      assert.equal(new URL(canonical).origin, 'https://emanuelmolla.dev')
      assert.equal(
        new URL(canonical).pathname,
        route,
        `${theme} ${route} canonical`,
      )
      assert.doesNotMatch(
        html,
        /NEXT_HTTP_ERROR_FALLBACK;500|Internal Server Error/,
      )
      checked++
    }
    const missing = await fetch(new URL('/no-such-portfolio-page', base), {
      headers: { Cookie: `theme=${theme}` },
    })
    // Next may stream a not-found page with a 200; it must still emit noindex.
    assert.ok([200, 404].includes(missing.status))
    assert.match(await missing.text(), /name="robots" content="noindex"/)
    console.log(
      `${theme}${theme === 'terminal' ? ' (disabled, Minimal fallback)' : ''}: ${routes.length} content routes and themed not-found checked`,
    )
  }
  for (const [source, destination] of [
    ['/projects', '/work'],
    ['/projects/vivid-africa', '/work/vivid-africa'],
  ]) {
    const response = await fetch(new URL(source, base), { redirect: 'manual' })
    assert.equal(response.status, 308)
    assert.equal(response.headers.get('location'), destination)
  }
  const sitemap = await (await fetch(new URL('/sitemap.xml', base))).text()
  for (const theme of ['unknown-theme', 'constructor', '__proto__']) {
    const response = await fetch(new URL('/', base), {
      headers: { Cookie: `theme=${theme}` },
    })
    assert.equal(response.status, 200, `Invalid theme cookie ${theme}`)
    assert.ok((await response.text()).includes('data-theme="clean"'))
  }
  assert.match(sitemap, /https:\/\/emanuelmolla.dev\/experience/)
  assert.doesNotMatch(sitemap, /theme=|\/projects/)
  console.log(
    `Passed ${checked} route checks, redirects, and canonical sitemap checks.`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
