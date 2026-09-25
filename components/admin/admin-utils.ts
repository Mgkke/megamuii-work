import type { SupabaseClient } from '@supabase/supabase-js'
import { createStorageObjectPath, extractStorageObjectPath, type StorageBucket } from '@/lib/admin-storage.mjs'

export type AdminProjectFile = {
  id: string
  project_id: string
  version: string
  file_name: string
  file_url: string
  file_size: number | null
  created_at: string
}

export type AdminProject = {
  id: string
  title: string
  slug: string
  short_description: string | null
  description: string | null
  installation: string[] | null
  cover_url: string | null
  created_at: string
  updated_at: string
  project_files?: AdminProjectFile[]
}

export type UploadedObject = { path: string; url: string }

export async function uploadAdminFile(
  supabase: SupabaseClient,
  bucket: StorageBucket,
  slug: string,
  file: File
): Promise<UploadedObject> {
  const path = createStorageObjectPath(slug, file.name)
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    cacheControl: '3600',
    ...(file.type ? { contentType: file.type } : {})
  })

  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { path, url: data.publicUrl }
}

export async function deleteAdminFile(supabase: SupabaseClient, bucket: StorageBucket, fileUrl: string | null | undefined) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl || !fileUrl) return false

  const path = extractStorageObjectPath(fileUrl, baseUrl, bucket)
  if (!path) return false

  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
  return true
}

export async function deleteAdminFileIfUnreferenced(
  supabase: SupabaseClient,
  bucket: StorageBucket,
  fileUrl: string | null | undefined,
  exclude: { projectId?: string; fileId?: string } = {}
): Promise<'removed' | 'shared' | 'unmanaged'> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl || !fileUrl) return 'unmanaged'
  const path = extractStorageObjectPath(fileUrl, baseUrl, bucket)
  if (!path) return 'unmanaged'

  let references = bucket === 'covers'
    ? supabase.from('projects').select('id').eq('cover_url', fileUrl)
    : supabase.from('project_files').select('id').eq('file_url', fileUrl)

  if (bucket === 'covers' && exclude.projectId) references = references.neq('id', exclude.projectId)
  if (bucket === 'downloads' && exclude.fileId) references = references.neq('id', exclude.fileId)
  if (bucket === 'downloads' && exclude.projectId) references = references.neq('project_id', exclude.projectId)

  const { data: otherReference, error: referenceError } = await references.limit(1).maybeSingle()
  if (referenceError) throw referenceError
  if (otherReference) return 'shared'

  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
  return 'removed'
}

export function formatAdminDate(value: string | null | undefined) {
  if (!value) return 'ยังไม่มีข้อมูล'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'ยังไม่มีข้อมูล'
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export function formatFileSize(size: number | null | undefined) {
  if (!size || size < 0) return 'ไม่ทราบขนาด'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function slugifyProjectTitle(value: string) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getAdminErrorMessage(error: unknown, fallback: string) {
  const cause = error as { code?: string; message?: string } | null
  if (cause?.code === '23505') return 'Slug หรือเวอร์ชันนี้มีอยู่แล้ว กรุณาเลือกค่าใหม่'
  if (cause?.code === '42501') return 'บัญชีนี้ไม่มีสิทธิ์จัดการข้อมูล กรุณาตรวจสอบ admin_users และ RLS'
  return cause?.message || fallback
}
