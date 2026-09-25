import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeDownloadFilename } from '../lib/download-filename.mjs'

test('strips only the timestamp and UUID upload prefix', () => {
  assert.equal(
    normalizeDownloadFilename('1790341867972-3382f310-e45d-453f-9127-dccad2cbc68e-DressmakerThai-v0.2.0.zip'),
    'DressmakerThai-v0.2.0.zip'
  )
})

test('preserves clean filenames with ordinary hyphens', () => {
  assert.equal(normalizeDownloadFilename('DressmakerThai-v0.2.0-final.zip'), 'DressmakerThai-v0.2.0-final.zip')
})

test('removes path components and control characters from download names', () => {
  assert.equal(normalizeDownloadFilename('../DressmakerThai\n-v0.2.0.zip'), 'DressmakerThai-v0.2.0.zip')
})
