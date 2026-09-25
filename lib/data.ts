import { projects as demoProjects, type Project } from './projects'
import { getSupabasePublicClient } from './supabase'

function formatThaiDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
}

export async function listProjects(): Promise<Project[]> {
  const supabase = getSupabasePublicClient()
  if (!supabase) return demoProjects

  const { data, error } = await supabase
    .from('projects')
    .select('slug,title,short_description,description,installation,cover_url,updated_at,project_files(version,file_name,file_url,created_at)')
    .order('updated_at', { ascending: false })

  if (error || !data) return []

  return data.map((row: any) => ({
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description ?? '',
    description: row.description ?? '',
    installation: row.installation ?? [],
    updatedAt: formatThaiDate(row.updated_at),
    coverLabel: row.cover_url || row.title,
    files: (row.project_files ?? [])
      .sort((a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at))
      .map((file: any) => ({
        version: file.version,
        fileName: file.file_name,
        fileUrl: file.file_url,
        date: formatThaiDate(file.created_at)
      }))
  }))
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const items = await listProjects()
  return items.find((item) => item.slug === slug)
}
