import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'

/**
 * Tests for the pure logic under the admin.
 *
 * node:test and nothing else. A single-person site does not need a test runner
 * with a config file, and these run in under a second with no dependency to keep
 * up to date.
 *
 * WHAT IS TESTED, and why it is these things: the functions here are the ones
 * whose bugs would be silent. A broken form control is visible the first time you
 * use it. A parallel-array reader that shifts a column by one, a date that comes
 * back a day early west of Greenwich, or a preview cookie that can be forged by
 * typing preview=1 are all things that look fine and are not.
 *
 * Not tested here: anything needing a database or a signed-in session. Those are
 * checked by using the admin.
 */

import {
  day,
  toDayInput,
  lines,
  tokens,
  rows,
  flag,
  optInt,
  optText,
  parseMedia,
  parseSeo,
  many,
  zodFieldErrors,
} from '../lib/admin/form'
import { mintPreviewToken, verifyPreviewToken } from '../lib/preview'
import { slugify } from '../lib/slug'
import { resumeFilename, contentDisposition } from '../lib/resume'
import { looksLikePdf } from '../lib/models/resume'
import { renderMarkdown, excerptFrom } from '../lib/markdown'

/**
 * Set after the imports on purpose, which is safe only because lib/preview reads
 * AUTH_SECRET lazily inside a function rather than at module scope. Imports are
 * hoisted above this line; a module that captured the value at load time would
 * see undefined here.
 */
process.env.AUTH_SECRET = 'test-secret-for-tests-only'

const fd = (pairs: [string, string][]) => {
  const f = new FormData()
  for (const [k, v] of pairs) f.append(k, v)
  return f
}

// ---- form coercion ----

test('empty string becomes null, not ""', () => {
  assert.equal(optText(fd([['a', '   ']]), 'a'), null)
  assert.equal(optText(fd([['a', 'x']]), 'a'), 'x')
})

test('missing checkbox is false', () => {
  assert.equal(flag(fd([]), 'featured'), false)
  assert.equal(flag(fd([['featured', 'on']]), 'featured'), true)
})

test('optInt rejects junk without throwing', () => {
  assert.equal(optInt(fd([['n', '']]), 'n'), null)
  assert.equal(optInt(fd([['n', 'abc']]), 'n'), null)
  assert.equal(optInt(fd([['n', '3']]), 'n'), 3)
  assert.equal(optInt(fd([['n', '-2']]), 'n'), -2)
})

test('date round trip is exact and UTC', () => {
  const d = day(fd([['x', '2026-03-01']]), 'x')
  assert.ok(d instanceof Date)
  assert.equal(d!.toISOString(), '2026-03-01T00:00:00.000Z')
  // The round trip is what matters: whatever TZ the server runs in, the day
  // that comes back must be the day that went in.
  assert.equal(toDayInput(d), '2026-03-01')
})

test('malformed dates are null, not Invalid Date', () => {
  assert.equal(day(fd([['x', 'March 1']]), 'x'), null)
  assert.equal(day(fd([['x', '']]), 'x'), null)
  assert.equal(toDayInput(null), '')
  assert.equal(toDayInput(new Date('nope')), '')
})

test('lines keeps commas inside a bullet', () => {
  const f = fd([['h', 'Cut p99 from 400ms to 90ms, mostly by batching\n\nSecond bullet  ']])
  assert.deepEqual(lines(f, 'h'), [
    'Cut p99 from 400ms to 90ms, mostly by batching',
    'Second bullet',
  ])
})

test('tokens splits on comma and newline', () => {
  assert.deepEqual(tokens(fd([['t', 'a, b\nc ,, d']]), 't'), ['a', 'b', 'c', 'd'])
})

test('many reads a multi-select', () => {
  const f = fd([
    ['techRefs', 'a'],
    ['techRefs', 'b'],
  ])
  assert.deepEqual(many(f, 'techRefs'), ['a', 'b'])
})

// ---- parallel-array rows (the alignment hazard) ----

test('rows zips columns in document order', () => {
  const f = fd([
    ['link.kind', 'repo'],
    ['link.kind', 'live'],
    ['link.url', 'https://a'],
    ['link.url', 'https://b'],
    ['link.label', 'A'],
    ['link.label', ''],
  ])
  const out = rows(f, { kind: 'link.kind', label: 'link.label', url: 'link.url' }, 'url')
  assert.deepEqual(out, [
    { kind: 'repo', label: 'A', url: 'https://a' },
    { kind: 'live', label: '', url: 'https://b' },
  ])
})

test('a blank required cell drops that row only', () => {
  const f = fd([
    ['link.kind', 'repo'],
    ['link.kind', 'live'],
    ['link.kind', 'demo'],
    ['link.url', 'https://a'],
    ['link.url', ''],
    ['link.url', 'https://c'],
    ['link.label', 'A'],
    ['link.label', 'B'],
    ['link.label', 'C'],
  ])
  const out = rows(f, { kind: 'link.kind', label: 'link.label', url: 'link.url' }, 'url')
  assert.equal(out.length, 2)
  // The row AFTER the dropped one must keep its own values, not inherit shifted ones.
  assert.deepEqual(out[1], { kind: 'demo', label: 'C', url: 'https://c' })
})

test('rows survives a short column without shifting', () => {
  const f = fd([
    ['link.kind', 'repo'],
    ['link.kind', 'live'],
    ['link.url', 'https://a'],
    ['link.url', 'https://b'],
  ])
  const out = rows(f, { kind: 'link.kind', label: 'link.label', url: 'link.url' }, 'url')
  assert.deepEqual(out, [
    { kind: 'repo', label: '', url: 'https://a' },
    { kind: 'live', label: '', url: 'https://b' },
  ])
})

test('no rows at all is an empty array', () => {
  assert.deepEqual(rows(fd([]), { kind: 'link.kind', url: 'link.url' }, 'url'), [])
})

// ---- media and seo ----

test('no url means no image, no error', () => {
  const r = parseMedia(fd([]), 'coverImage')
  assert.equal(r.value, null)
  assert.equal('error' in r ? r.error : undefined, undefined)
})

test('url without dimensions is rejected with a named field', () => {
  const r = parseMedia(fd([['coverImage.url', 'https://x/a.png']]), 'coverImage')
  assert.equal(r.value, null)
  assert.ok('error' in r && r.error)
  assert.ok(Object.keys((r as { error: Record<string, string> }).error)[0] === 'coverImage.width')
})

test('url with dimensions but no alt is rejected', () => {
  const r = parseMedia(
    fd([
      ['coverImage.url', 'https://x/a.png'],
      ['coverImage.width', '1200'],
      ['coverImage.height', '630'],
    ]),
    'coverImage'
  )
  assert.ok('error' in r && r.error && 'coverImage.alt' in r.error)
})

test('a complete image parses', () => {
  const r = parseMedia(
    fd([
      ['coverImage.url', 'https://x/a.png'],
      ['coverImage.width', '1200'],
      ['coverImage.height', '630'],
      ['coverImage.alt', 'A diagram'],
    ]),
    'coverImage'
  )
  assert.deepEqual(r.value, {
    url: 'https://x/a.png',
    alt: 'A diagram',
    width: 1200,
    height: 630,
    blurDataURL: null,
    caption: null,
  })
})

test('empty seo fields are null so the content wins', () => {
  assert.deepEqual(parseSeo(fd([])), {
    title: null,
    description: null,
    ogImage: null,
    canonicalUrl: null,
    noindex: false,
  })
})

// ---- zod error flattening ----

test('nested paths become the dotted input name', async () => {
  const { z } = await import('zod')
  const schema = z.object({ bio: z.object({ short: z.string().max(5) }) })
  const result = schema.safeParse({ bio: { short: 'far too long' } })
  assert.ok(!result.success)
  const errors = zodFieldErrors(result.error)
  assert.ok('bio.short' in errors, `got ${JSON.stringify(errors)}`)
})

// ---- preview token (this is what guards drafts) ----

test('a minted token verifies', () => {
  assert.equal(verifyPreviewToken(mintPreviewToken()!), true)
})

test('a hand-written cookie does NOT verify', () => {
  assert.equal(verifyPreviewToken('1'), false)
  assert.equal(verifyPreviewToken('true'), false)
  assert.equal(verifyPreviewToken(undefined), false)
  assert.equal(verifyPreviewToken(''), false)
})

test('a tampered signature is rejected', () => {
  const t = mintPreviewToken()!
  const [exp, sig] = t.split('.')
  assert.equal(verifyPreviewToken(`${exp}.${sig.slice(0, -1)}X`), false)
})

test('extending the expiry invalidates the signature', () => {
  const t = mintPreviewToken()!
  const [, sig] = t.split('.')
  const far = String(Date.now() + 99_999_999)
  assert.equal(verifyPreviewToken(`${far}.${sig}`), false)
})

test('an expired token is rejected', () => {
  // Signed correctly, but in the past.
  const past = String(Date.now() - 1000)
  const sig = createHmac('sha256', process.env.AUTH_SECRET!).update(past).digest('base64url')
  assert.equal(verifyPreviewToken(`${past}.${sig}`), false)
})

test('a token from a different secret is rejected', () => {
  const exp = String(Date.now() + 60000)
  const sig = createHmac('sha256', 'someone-elses-secret').update(exp).digest('base64url')
  assert.equal(verifyPreviewToken(`${exp}.${sig}`), false)
})

// ---- slugs ----

test('accents are stripped, not dropped', () => {
  assert.equal(slugify('Café Project'), 'cafe-project')
  assert.equal(slugify('Ethiopian Résumé'), 'ethiopian-resume')
})

test('punctuation collapses and edges trim', () => {
  assert.equal(slugify('  Hello --- World!!  '), 'hello-world')
  assert.equal(slugify('a/b/c'), 'a-b-c')
})

test('empty in, empty out', () => {
  assert.equal(slugify(''), '')
  assert.equal(slugify('!!!'), '')
})

// ---- resume naming ----

test('the filename is what he asked for', () => {
  assert.equal(resumeFilename('Emanuel Molla'), 'emanuel_molla_resume.pdf')
})

test('missing name falls back rather than producing _resume.pdf', () => {
  assert.equal(resumeFilename(null), 'resume.pdf')
  assert.equal(resumeFilename(''), 'resume.pdf')
})

test('disposition carries both plain and encoded names', () => {
  const d = contentDisposition('emanuel_molla_resume.pdf')
  assert.ok(d.startsWith('inline; '))
  assert.ok(d.includes('filename="emanuel_molla_resume.pdf"'))
  assert.ok(d.includes("filename*=UTF-8''"))
  assert.ok(contentDisposition('x.pdf', true).startsWith('attachment; '))
})

test('a quote in the name cannot break out of the header', () => {
  const d = contentDisposition('a"b.pdf')
  const plain = d.match(/filename="([^"]*)"/)![1]
  assert.ok(!plain.includes('"'))
})

// ---- pdf sniffing ----

test('real PDF magic bytes pass', () => {
  assert.equal(looksLikePdf(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])), true)
})

test('a renamed text file fails', () => {
  assert.equal(looksLikePdf(new TextEncoder().encode('hello world')), false)
  assert.equal(looksLikePdf(new Uint8Array([])), false)
  assert.equal(looksLikePdf(new Uint8Array([0x25, 0x50])), false)
})

// ---- markdown (the editor preview uses this exact function) ----

test('headings, code and links render', () => {
  const html = renderMarkdown('## Title\n\nSome `code` and [a link](https://x).')
  assert.ok(html.includes('<h2'))
  assert.ok(html.includes('<code>code</code>'))
  assert.ok(html.includes('href="https://x"'))
})

test('excerpt strips markup and takes the first paragraph', () => {
  const e = excerptFrom('# Heading\n\nSecond para.')
  assert.ok(!e.includes('#'))
})
