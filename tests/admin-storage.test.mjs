import test from 'node:test'
import assert from 'node:assert/strict'
import { createStorageObjectPath, extractStorageObjectPath } from '../lib/admin-storage.mjs'

const supabaseUrl = 'https://example.supabase.co'

test('extracts an object path from a public URL in the requested bucket', () => {
  assert.equal(
    extractStorageObjectPath(
      'https://example.supabase.co/storage/v1/object/public/covers/dressmaker/cover%20art.png',
      supabaseUrl,
      'covers'
    ),
    'dressmaker/cover art.png'
  )
})

test('rejects a URL from another origin or bucket', () => {
  assert.equal(
    extractStorageObjectPath('https://attacker.example/storage/v1/object/public/covers/a.png', supabaseUrl, 'covers'),
    null
  )
  assert.equal(
    extractStorageObjectPath('https://example.supabase.co/storage/v1/object/public/downloads/a.zip', supabaseUrl, 'covers'),
    null
  )
})

test('rejects malformed encoding and traversal paths', () => {
  assert.equal(
    extractStorageObjectPath('https://example.supabase.co/storage/v1/object/public/covers/bad%ZZ.png', supabaseUrl, 'covers'),
    null
  )
  assert.equal(
    extractStorageObjectPath('https://example.supabase.co/storage/v1/object/public/covers/%2E%2E/private.zip', supabaseUrl, 'covers'),
    null
  )
})

test('creates a slug-scoped unique filename without trusting the supplied basename', () => {
  assert.equal(
    createStorageObjectPath('Dressmaker Thai', 'C:\\fakepath\\Dressmaker final.zip', 1234, 'unique-id'),
    'dressmaker-thai/1234-unique-id-Dressmaker-final.zip'
  )
})
