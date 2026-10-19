import { test } from 'node:test'
import assert from 'node:assert/strict'
import { enabledThemeIds, validateEnabledThemes, resolveEnabledTheme, requireThemeDatabase } from '../lib/theme/policy'

const registered = ['clean', 'chess', 'desktop', 'terminal']

test('defaults enable Minimal, Clubroom and Desktop, leaving Terminal disabled', () => {
  assert.deepEqual(enabledThemeIds(registered), ['clean', 'chess', 'desktop'])
})
test('canonical theme cannot be disabled, even by stale stored data', () => {
  assert.throws(() => validateEnabledThemes(['terminal'], registered), /Minimal/)
  assert.deepEqual(enabledThemeIds(registered, []), ['clean'])
})
test('only registered IDs can be saved or resolved', () => {
  for (const id of ['unknown', '__proto__', 'constructor']) {
    assert.throws(() => validateEnabledThemes(['clean', id], registered), /registered/)
    assert.equal(resolveEnabledTheme(id, enabledThemeIds(registered)), 'clean')
  }
  assert.throws(() => validateEnabledThemes('clean', registered))
})
test('disabled cookies and public selections fall back to Minimal', () => {
  const enabled = enabledThemeIds(registered)
  assert.equal(resolveEnabledTheme('terminal', enabled), 'clean')
  assert.equal(resolveEnabledTheme(undefined, enabled), 'clean')
  assert.equal(resolveEnabledTheme('chess', enabled), 'chess')
  assert.equal(resolveEnabledTheme('terminal', validateEnabledThemes(['clean', 'terminal'], registered)), 'terminal')
})
test('saving without MongoDB fails explicitly', () => {
  assert.throws(() => requireThemeDatabase(false), /requires MongoDB/)
  assert.doesNotThrow(() => requireThemeDatabase(true))
})
