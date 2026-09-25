export type StorageBucket = 'covers' | 'downloads'

export function extractStorageObjectPath(
  fileUrl: string,
  supabaseUrl: string,
  bucket: StorageBucket
): string | null

export function createStorageObjectPath(
  slug: string,
  originalName: string,
  timestamp?: number,
  uniqueId?: string
): string
