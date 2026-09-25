const SAFE_BUCKETS = new Set(['covers', 'downloads'])

function safeSegment(value, fallback) {
  const safe = String(value ?? '')
    .normalize('NFC')
    .replace(/[\\/]+/g, '-')
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 120)

  return safe || fallback
}

export function extractStorageObjectPath(fileUrl, supabaseUrl, bucket) {
  if (!SAFE_BUCKETS.has(bucket)) return null

  try {
    const base = new URL(supabaseUrl)
    const objectUrl = new URL(fileUrl)
    if (base.origin !== objectUrl.origin || objectUrl.username || objectUrl.password) return null

    const prefix = `/storage/v1/object/public/${bucket}/`
    if (!objectUrl.pathname.startsWith(prefix)) return null

    const encodedPath = objectUrl.pathname.slice(prefix.length)
    const objectPath = decodeURIComponent(encodedPath)
    const segments = objectPath.split('/')

    if (
      !objectPath ||
      objectPath.startsWith('/') ||
      objectPath.includes('\\') ||
      /[\u0000-\u001f\u007f]/.test(objectPath) ||
      segments.some((segment) => !segment || segment === '.' || segment === '..')
    ) {
      return null
    }

    return objectPath
  } catch {
    return null
  }
}

export function createStorageObjectPath(slug, originalName, timestamp = Date.now(), uniqueId = globalThis.crypto.randomUUID()) {
  const projectFolder = safeSegment(slug.toLowerCase(), 'project')
  const basename = String(originalName ?? '').split(/[\\/]/).pop()
  const filename = safeSegment(basename, 'upload.bin')
  const unique = safeSegment(uniqueId, globalThis.crypto.randomUUID())
  const time = String(Math.max(0, Math.trunc(Number(timestamp) || 0)))

  return `${projectFolder}/${time}-${unique}-${filename}`
}
