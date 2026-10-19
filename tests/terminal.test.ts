import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'
import {
  complete,
  execute,
  fileSystem,
  resolvePath,
  workingDirectory,
} from '../themes/terminal/commands'
import manifest from '../themes/terminal/manifest'
import clean from '../themes/clean/manifest'
import { Output } from '../themes/terminal/Output'
import {
  ContentKind,
  RenderContext,
  ThemeManifest,
} from '../lib/theme/contract'
import {
  Home,
  About,
  WorkItem,
  WorkIndex,
  PostItem,
  PostIndex,
  PageView,
  ExperienceView,
  Contact,
} from '../themes/terminal/views'
import {
  seedProfile,
  seedWork,
  seedPosts,
  seedExperience,
} from '../lib/content/_seed'
import { zPage } from '../lib/models/page'
import {
  appendOutput,
  clearSession,
  readPage,
  readSession,
  subscribeSession,
} from '../themes/terminal/session'

test('command session survives route remounts and stays bounded', () => {
  clearSession()
  let changed = 0
  const stop = subscribeSession(() => changed++)
  appendOutput({ command: 'ls', output: 'about.md' })
  assert.deepEqual(readSession().history, ['ls'])
  appendOutput({ command: 'cat /ab', output: 'cat /about.md' }, false)
  assert.equal(readSession().history.length, 1)
  assert.equal(readSession().lines.length, 2)
  for (let i = 0; i < 120; i++) appendOutput({ command: 'pwd', output: '/' })
  assert.equal(readSession().history.length, 100)
  assert.equal(readSession().lines.length, 40)
  assert.ok(changed > 0)
  stop()
  clearSession()
})

const files = fileSystem([
  '/work/example',
  '/blog/entry',
  '/uses',
  '//evil.test',
  'https://evil.test',
])
test('terminal preserves canonical routes and declares every context', () => {
  assert.ok(ThemeManifest.safeParse(manifest).success)
  assert.deepEqual(manifest.routes, clean.routes)
  for (const kind of ContentKind.options)
    assert.deepEqual(manifest.renders[kind], RenderContext.options)
})
test('commands list literal files and navigate canonical routes', () => {
  assert.match(execute('ls', '/', files).output, /work\//)
  assert.match(execute('ls /work', '/', files).output, /example.md/)
  assert.equal(execute('cat example.md', '/work', files).href, '/work/example')
  assert.equal(execute('cat /index.md', '/blog', files).href, '/')
  assert.equal(execute('cat /uses.md', '/', files).href, '/uses')
  assert.equal(execute('cd ../blog', '/work', files).href, '/blog')
  assert.equal(execute('cd', '/work', files).href, '/')
  assert.equal(execute('pwd', '/work', files).output, '/work')
  assert.deepEqual(execute('clear', '/', files), { output: '', clear: true })
  assert.match(execute('help', '/', files).output, /cat <file>/)
})
test('paths normalize safely and unsupported shell syntax never navigates', () => {
  assert.equal(resolvePath('../../about.md', '/work'), '/about.md')
  assert.equal(resolvePath('~/about.md', '/work'), '/about.md')
  for (const command of [
    'cat $(id)',
    'cat /about.md;ls',
    'cat https://evil.test',
    'cat //evil.test',
    'cat /missing',
    'rm /about',
    'cat /work',
    'cd /about.md',
    'pwd extra',
    'cat a b',
    'cat',
    'cat /%2e%2e',
  ]) {
    const result = execute(command, '/', files)
    assert.equal(result.href, undefined, command)
    assert.ok(result.output, command)
  }
  assert.equal(workingDirectory('/work/example'), '/work')
  assert.equal(workingDirectory('/blog/entry'), '/blog')
  assert.equal(workingDirectory('/workshop'), '/')
})
test('completion uses real files, directories and command names', () => {
  assert.deepEqual(complete('pw', '/', files), ['pwd'])
  assert.deepEqual(complete('cd /wo', '/', files), ['cd /work/'])
  assert.deepEqual(complete('cat ex', '/work', files), ['cat example.md'])
  assert.deepEqual(complete('cat ../blog/en', '/work', files), [
    'cat ../blog/entry.md',
  ])
  assert.deepEqual(complete('cat /missing', '/', files), [])
  assert.deepEqual(complete('cat $(id)', '/', files), [])
})
test('direct full route views expose content in server HTML', () => {
  const page = zPage.parse({
    slug: 'uses',
    seo: {},
    title: 'Tools in use',
    body: 'Visible custom page text',
    sections: [{ heading: 'Editor', body: 'Visible section' }],
  })
  const cases = [
    [
      createElement(Home, {
        profile: seedProfile,
        work: seedWork,
        posts: seedPosts,
      }),
      seedProfile.name,
    ],
    [
      createElement(About, {
        profile: seedProfile,
        experience: seedExperience,
      }),
      seedProfile.bio.short,
    ],
    [
      createElement(WorkItem, {
        work: { ...seedWork[0], coverImage: null, gallery: [] },
      }),
      seedWork[0].title,
    ],
    [
      createElement(WorkIndex, { items: seedWork }),
      `/work/${seedWork[0].slug}`,
    ],
    [
      createElement(PostItem, { post: { ...seedPosts[0], coverImage: null } }),
      seedPosts[0].title,
    ],
    [
      createElement(PostIndex, { items: seedPosts }),
      `/blog/${seedPosts[0].slug}`,
    ],
    [createElement(PageView, { page }), 'Visible custom page text'],
    [
      createElement(ExperienceView, { experience: seedExperience }),
      seedExperience[0].role,
    ],
    [createElement(Contact, { profile: seedProfile }), 'Contact'],
  ] as const
  for (const [element, expected] of cases) {
    const html = renderToStaticMarkup(element)
    const escaped = expected
      .replaceAll('&', '&amp;')
      .replaceAll("'", '&#x27;')
      .replaceAll('"', '&quot;')
    assert.ok(html.includes(escaped), expected)
    assert.match(html, /<h1/)
  }
})
test('server views stay outside client boundary and navigation stays canonical', () => {
  const shell = readFileSync('themes/terminal/Shell.tsx', 'utf8')
  const views = readFileSync('themes/terminal/views.tsx', 'utf8')
  assert.match(shell, /^["']use client["']/)
  assert.doesNotMatch(views, /^["']use client["']/)
  assert.doesNotMatch(shell, /from ["']\.\/views["']/)
  assert.match(shell, /<Output/)
  assert.doesNotMatch(
    shell,
    /<header|<nav|<footer|terminal-suggestions|type="submit"/
  )
  assert.match(shell, /router.push\(result.href\)/)
  assert.ok(!shell.includes('autoFocus'))
})

test('initial console contains only welcome and a collapsed no-JS home fallback', () => {
  const html = renderToStaticMarkup(
    createElement(
      Output,
      {
        siteName: seedProfile.name,
        path: '/',
        lines: [],
        showPage: false,
        showWelcome: true,
      },
      createElement('h1', null, 'Detailed home')
    )
  )
  assert.match(html, /Welcome to/)
  assert.match(
    html,
    /<details class="terminal-fallback"><summary>Read portfolio without commands<\/summary><h1>Detailed home/
  )
  assert.doesNotMatch(html, /<details[^>]* open|<header|<nav|<button/)
  const css = readFileSync('themes/terminal/terminal.css', 'utf8')
  assert.match(css, /\.terminal-fallback\s*\{\s*display:\s*none;\s*\}/)
  assert.match(css, /min-height: 100dvh/)
})

test('direct routes and requested home print server content inside output', () => {
  for (const path of ['/about', '/work/example', '/blog/entry', '/uses', '/']) {
    const html = renderToStaticMarkup(
      createElement(
        Output,
        {
          siteName: seedProfile.name,
          path,
          lines: [],
          showPage: true,
          showWelcome: true,
        },
        createElement(
          'article',
          null,
          createElement(
            'h1',
            null,
            path === '/about' ? 'About' : 'Route content'
          ),
          createElement('a', { href: '/about' }, 'About')
        )
      )
    )
    assert.match(
      html,
      /class="terminal-log"[\s\S]*id="terminal-content"><article>/
    )
    assert.match(html, /href="\/about"/)
    assert.doesNotMatch(html, /<details/)
  }
})

test('home reads, clear, history and retained output are session state', () => {
  clearSession()
  readPage('/')
  assert.equal(readSession().readPath, '/')
  appendOutput({
    command: 'cat /about.md',
    output: '',
    content: createElement('p', null, 'Retained about'),
  })
  const html = renderToStaticMarkup(
    createElement(Output, {
      siteName: 'Portfolio',
      path: '/',
      lines: readSession().lines,
      showWelcome: false,
      showPage: false,
    })
  )
  assert.match(html, /Retained about/)
  assert.equal(
    execute('history', '/', files, ['ls', 'help']).output,
    '1  ls\n2  help'
  )
  assert.equal(execute('history extra', '/', files).href, undefined)
  clearSession('/about')
  assert.equal(readSession().hiddenPath, '/about')
  assert.equal(readSession().readPath, undefined)
  assert.equal(readSession().lines.length, 0)
  readPage('/about')
  assert.equal(readSession().hiddenPath, undefined)
  clearSession()
})
