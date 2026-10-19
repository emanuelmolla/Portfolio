import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import path from 'node:path'
import {
  assertThemeModule,
  ThemeManifest,
  type ThemeModule,
} from '../lib/theme/contract'
import clean from '../themes/clean/manifest'
import desktop from '../themes/desktop/manifest'
import chess from '../themes/chess/manifest'
import terminal from '../themes/terminal/manifest'
import openings from '../themes/chess/openings.json'
import { piecesFromFen, positionAt } from '../themes/chess/position'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  PageView,
  WorkItem,
  WorkIndex,
  PostIndex,
  ExperienceView,
} from '../themes/chess/views'
import { zPage } from '../lib/models/page'
import { seedWork, seedPosts, seedExperience } from '../lib/content/_seed'
import { GameFrame, GameHud } from '../themes/chess/GameFrame'
import { StudyClock } from '../themes/chess/Clock'
import {
  readPaused,
  subscribePaused,
  togglePaused,
  readClock,
  subscribeClock,
} from '../themes/chess/motion-store'

for (const manifest of [clean, desktop, chess, terminal]) {
  test(`${manifest.id} declares the same public routes as the canonical theme`, () => {
    assert.ok(ThemeManifest.safeParse(manifest).success)
    assert.deepEqual(manifest.routes, clean.routes)
    for (const route of Object.values(manifest.routes)) {
      for (const pattern of [route.pattern, route.indexPattern].filter(
        Boolean,
      ) as string[]) {
        const file = pattern
          .split('/')
          .filter(Boolean)
          .map((segment) =>
            segment.startsWith(':') ? `[${segment.slice(1)}]` : segment,
          )
        assert.ok(
          existsSync(path.join(process.cwd(), 'app', ...file, 'page.tsx')),
          `Missing route ${pattern}`,
        )
      }
    }
  })
}

test('the contract rejects a promised renderer that is missing', () => {
  const view = () => null
  const theme: ThemeModule = {
    manifest: chess,
    Shell: view,
    views: {
      profile: { full: view },
      page: { full: view },
      work: { full: view, summary: view },
      post: { full: view, summary: view },
      experience: { full: view },
      contact: { full: view },
    },
  }
  assert.doesNotThrow(() => assertThemeModule(theme))
  delete theme.views.work?.summary
  assert.throws(() => assertThemeModule(theme), /missing work.summary/)
})

test('the contract rejects a kind declared as both rendered and omitted', () => {
  assert.throws(
    () =>
      assertThemeModule({
        manifest: { ...chess, omits: ['work'] },
        Shell: () => null,
        views: { profile: { full: () => null }, page: { full: () => null } },
      }),
    /both renders and omits work|missing/,
  )
})

test('the initial position has 32 distinct pieces on 32 squares', () => {
  const pieces = piecesFromFen(openings.sequences[0].initialFen)
  assert.equal(pieces.length, 32)
  assert.equal(new Set(pieces.map((piece) => piece.id)).size, 32)
  assert.equal(pieces.find((piece) => piece.square === 'a1')?.role, 'rook')
  assert.equal(pieces.find((piece) => piece.square === 'e8')?.color, 'black')
})

for (const sequence of openings.sequences) {
  test(`the ${sequence.id} study preserves piece identities and exact positions`, () => {
    const initialIds = new Set(
      piecesFromFen(sequence.initialFen).map((piece) => piece.id),
    )
    for (let ply = 1; ply <= sequence.plies.length; ply++) {
      const move = sequence.plies[ply - 1]
      const before = positionAt(sequence, ply - 1)
      const pieces = positionAt(sequence, ply)
      assert.equal(
        sequence.plies[ply - 1].beforeFen,
        ply === 1 ? sequence.initialFen : sequence.plies[ply - 2].afterFen,
      )
      assert.deepEqual(
        pieces.map(({ square, role, color }) => ({ square, role, color })),
        piecesFromFen(move.afterFen).map(({ square, role, color }) => ({
          square,
          role,
          color,
        })),
      )
      assert.equal(new Set(pieces.map((piece) => piece.id)).size, pieces.length)
      assert.ok(pieces.every((piece) => initialIds.has(piece.id)))
      assert.equal(
        pieces.find((piece) => piece.square === move.toSquare)?.id,
        before.find((piece) => piece.square === move.fromSquare)?.id,
      )
      assert.equal(pieces.length, before.length - (move.isCapture ? 1 : 0))
    }
  })
}

test('CMS prose and structured sections render as HTML without client interaction', () => {
  const page = zPage.parse({
    slug: 'uses',
    title: 'Uses',
    body: '## Toolkit\n\nA real paragraph.',
    sections: [{ heading: 'Hardware', body: '**Computer** details.' }],
    seo: {},
  })
  const html = renderToStaticMarkup(createElement(PageView, { page }))
  assert.match(html, /<h1>Uses<\/h1>/)
  assert.match(html, /<h2>Toolkit<\/h2>/)
  assert.match(html, /<strong>Computer<\/strong>/)
  assert.match(html, /Hardware/)
})

test('older projects without a gallery or software details still render', () => {
  const work = { ...seedWork[0], details: null, coverImage: null }
  Reflect.deleteProperty(work, 'gallery')
  const html = renderToStaticMarkup(createElement(WorkItem, { work, tech: [] }))
  assert.ok(html.includes(work.title))
  assert.ok(html.includes(work.summary))
})

test('index records follow the page heading without skipping a level', () => {
  for (const element of [
    createElement(WorkIndex, { items: seedWork, heading: 'Work' }),
    createElement(PostIndex, { items: seedPosts, heading: 'Writing' }),
    createElement(ExperienceView, { experience: seedExperience }),
  ]) {
    const html = renderToStaticMarkup(element)
    assert.match(html, /<h1[\s>]/)
    assert.match(html, /<h2[\s>]/)
    assert.doesNotMatch(html, /<h3[\s>]/)
  }
})

test('game chrome keeps content and navigation in server-rendered HTML', () => {
  const html = renderToStaticMarkup(
    createElement(
      GameFrame,
      null,
      createElement(GameHud, { section: 'About' }),
      createElement('h1', null, 'About Emanuel'),
      createElement('a', { href: '/work' }, 'Work'),
    ),
  )
  assert.match(html, /Session clock/)
  assert.match(html, /00:00/)
  assert.doesNotMatch(html, /Pause animations/)
  assert.match(html, /Clock and motion settings/)
  assert.match(html, /<h1>About Emanuel<\/h1>/)
  assert.match(html, /href="\/work"/)
})

test('only the moving side runs a study dial, and completing a line stops both', () => {
  for (const whiteToMove of [true, false]) {
    const html = renderToStaticMarkup(
      createElement(StudyClock, { whiteToMove, complete: false }),
    )
    assert.equal((html.match(/is-running/g) || []).length, 1)
    assert.match(html, new RegExp(`${whiteToMove ? 'White' : 'Black'} to move`))
    assert.equal((html.match(/chess-clock-second/g) || []).length, 2)
  }
  const complete = renderToStaticMarkup(
    createElement(StudyClock, { whiteToMove: true, complete: true }),
  )
  assert.doesNotMatch(complete, /is-running/)
  assert.match(complete, /Study complete/)
})

test('one session ticker survives navigation and respects pause and reduced motion', (t) => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const storage = new Map<string, string>()
  let now = 0
  let reduced = false
  let tick: (() => void) | undefined
  let intervals = 0
  let clears = 0
  let notifications = 0
  t.mock.method(performance, 'now', () => now)
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      matchMedia: () => ({ matches: reduced }),
      setInterval: (callback: () => void) => {
        tick = callback
        intervals++
        return 1
      },
      clearInterval: () => {
        clears++
        tick = undefined
      },
    },
  })
  const stopPreference = subscribePaused(() => notifications++)
  let stopA = () => {}
  let stopB = () => {}
  let stopC = () => {}
  try {
    stopA = subscribeClock(() => {})
    stopB = subscribeClock(() => {})
    assert.equal(intervals, 1)
    now = 1000
    tick?.()
    assert.equal(readClock(), 1)
    togglePaused()
    assert.equal(readPaused(), true)
    now = 2000
    tick?.()
    assert.equal(readClock(), 1)
    stopA()
    stopB()
    assert.equal(clears, 1)
    stopC = subscribeClock(() => {})
    assert.equal(readClock(), 1)
    togglePaused()
    assert.equal(readPaused(), false)
    now = 3500
    tick?.()
    assert.equal(readClock(), 2)
    reduced = true
    now = 4500
    tick?.()
    assert.equal(readClock(), 2)
    assert.equal(notifications, 2)
    assert.equal(storage.get('clubroom-motion'), 'running')
    t.mock.method(window.localStorage, 'setItem', () => {
      throw new Error('Storage is read-only')
    })
    togglePaused()
    assert.equal(readPaused(), true)
    togglePaused()
    assert.equal(readPaused(), false)
  } finally {
    stopC()
    stopPreference()
    if (originalWindow)
      Object.defineProperty(globalThis, 'window', originalWindow)
    else Reflect.deleteProperty(globalThis, 'window')
  }
})
