import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DESKTOP_MIN_WIDTH,
  safeReturnPath,
  THEME_ORDER,
} from '../lib/theme/appearance'

test('theme order keeps Clubroom second and Desktop last', () => {
  assert.equal(THEME_ORDER[0], 'clean')
  assert.equal(THEME_ORDER[1], 'chess')
  assert.equal(THEME_ORDER.at(-1), 'desktop')
  assert.equal(DESKTOP_MIN_WIDTH, 1024)
})
test('appearance return paths cannot redirect to an external origin', () => {
  for (const input of [
    'https://example.com',
    '//example.com',
    '/\\example.com',
    '/\r\nexample.com',
    null,
  ])
    assert.equal(safeReturnPath(input), '/')
  assert.equal(
    safeReturnPath('/work/devnest?view=all#details'),
    '/work/devnest?view=all#details'
  )
})
