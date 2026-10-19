import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync, existsSync } from 'node:fs'
import { DesktopSession, DesktopWindow } from '../themes/desktop/Window'
import {
  AppRouterContext,
  type AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime'
import {
  moveNote,
  readDesktop,
  resetDesktop,
  setMaximized,
} from '../themes/desktop/session'

const router: AppRouterInstance = {
  back() {},
  forward() {},
  refresh() {},
  push() {},
  replace() {},
  prefetch() {},
  bfcacheId: 'test',
}
function renderDesktop(path: string) {
  const window = createElement(
    DesktopWindow,
    { title: 'Home folder' },
    createElement('h1', null, 'Portfolio content')
  )
  return renderToStaticMarkup(
    createElement(
      AppRouterContext.Provider,
      { value: router },
      createElement(DesktopSession, { path }, window)
    )
  )
}

test('direct app routes ship open with labelled window controls and SSR content', () => {
  const html = renderDesktop('/about')
  for (const label of ['Close window', 'Minimise window', 'Maximise window'])
    assert.ok(html.includes(label))
  assert.match(html, /data-window-state="open"/)
  assert.match(html, /<h1>Portfolio content<\/h1>/)
  assert.doesNotMatch(html, / hidden=/)
})
test('the bare desktop does not open Home automatically', () => {
  const html = renderDesktop('/')
  assert.match(html, /data-window-state="closed"/)
  assert.match(html, /hidden=""/)
  assert.match(html, /Portfolio content/)
})
test('maximisation and note positions survive navigation without storing content', () => {
  resetDesktop()
  setMaximized(true)
  moveNote('hello', { x: 10, y: -20 })
  assert.equal(readDesktop().maximized, true)
  assert.deepEqual(readDesktop().notes.hello, { x: 10, y: -20 })
  resetDesktop()
})
test('rich desktop documents use Markdown names', () => {
  const files = ['themes/desktop/views.tsx', 'themes/desktop/Experience.tsx']
  for (const file of files)
    assert.doesNotMatch(readFileSync(file, 'utf8'), /\.txt/)
})
test('custom cursor hotspots are backed by small local SVGs', () => {
  for (const name of ['cursor-arrow', 'cursor-pawn', 'cursor-text']) {
    const svg = readFileSync(`public/themes/chess/${name}.svg`, 'utf8')
    assert.match(svg, /width="32" height="32"/)
    assert.ok(svg.length < 2000)
  }
  assert.ok(existsSync('public/themes/desktop/wallpaper.svg'))
})
