const INTERNAL_UPLOAD_PREFIX = /^\d{10,}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.+)$/i

export function normalizeDownloadFilename(fileName) {
  const basename = String(fileName ?? '').replace(/\\/g, '/').split('/').pop() ?? ''
  const withoutControls = basename.replace(/[\u0000-\u001f\u007f]/g, '')
  const match = withoutControls.match(INTERNAL_UPLOAD_PREFIX)
  return (match?.[1] ?? withoutControls).trim() || 'download'
}
