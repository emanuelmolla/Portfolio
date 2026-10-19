import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'

test('Vercel uses the Next.js build instead of the legacy Vite output', () => {
  const config = JSON.parse(readFileSync('vercel.json', 'utf8'))
  assert.equal(config.framework, 'nextjs')
  assert.equal(config.outputDirectory, '.next')
  assert.equal(config.buildCommand, 'npm run build')
  assert.equal(config.rewrites, undefined)
})
