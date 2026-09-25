'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { AdminProjectCard } from './AdminProjectCard'
import { StatusMessage } from './AdminControls'
import { useAdmin } from './AdminShell'
import { deleteAdminFileIfUnreferenced, getAdminErrorMessage, type AdminProject } from './admin-utils'

export function AdminDashboard() {
  const { supabase } = useAdmin()
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'success' | 'error' | 'info'>('info')

  const loadProjects = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('projects')
      .select('id,title,slug,short_description,description,installation,cover_url,created_at,updated_at,project_files(id,project_id,version,file_name,file_url,file_size,created_at)')
      .order('updated_at', { ascending: false })
    if (error) {
      setMessage(getAdminErrorMessage(error, 'โหลดรายการโปรเจกต์ไม่สำเร็จ'))
      setMessageTone('error')
      setProjects([])
    } else {
      setProjects((data ?? []) as AdminProject[])
      setMessage('')
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { void loadProjects() }, [loadProjects])

  async function deleteProject(project: AdminProject) {
    setDeleting(true)
    setMessage('')
    try {
      const { data, error } = await supabase.from('projects')
        .select('id,cover_url,project_files(id,project_id,file_url)')
        .eq('id', project.id)
        .maybeSingle()
      if (error) throw error
      if (!data) throw new Error('ไม่พบโปรเจกต์นี้แล้ว')

      const fileRows = (data.project_files ?? []) as Array<{ id: string; project_id: string; file_url: string }>
      if (fileRows.some((file) => file.project_id !== project.id)) throw new Error('พบไฟล์ที่ไม่ได้เป็นของโปรเจกต์นี้ จึงยกเลิกการลบเพื่อความปลอดภัย')

      let skippedObjects = 0
      const seenDownloads = new Set<string>()
      for (const file of fileRows) {
        if (seenDownloads.has(file.file_url)) continue
        seenDownloads.add(file.file_url)
        const result = await deleteAdminFileIfUnreferenced(supabase, 'downloads', file.file_url, { projectId: project.id })
        if (result !== 'removed') skippedObjects += 1
      }
      const coverResult = await deleteAdminFileIfUnreferenced(supabase, 'covers', data.cover_url, { projectId: project.id })
      if (data.cover_url && coverResult !== 'removed') skippedObjects += 1

      const { error: filesError } = await supabase.from('project_files').delete().eq('project_id', project.id)
      if (filesError) throw filesError
      const { data: deleted, error: projectError } = await supabase.from('projects').delete().eq('id', project.id).select('id').maybeSingle()
      if (projectError) throw projectError
      if (!deleted) throw new Error('ลบข้อมูลโปรเจกต์ไม่สำเร็จ หรือบัญชีนี้ไม่มีสิทธิ์')

      setProjects((current) => current.filter((item) => item.id !== project.id))
      setMessage(skippedObjects
        ? `ลบโปรเจกต์แล้ว แต่มี ${skippedObjects} URL ที่ไม่ใช่ Storage path ของ Supabase จึงไม่ได้ลบ object ภายนอก`
        : 'ลบโปรเจกต์ เวอร์ชัน ไฟล์ดาวน์โหลด และภาพปกเรียบร้อยแล้ว')
      setMessageTone(skippedObjects ? 'info' : 'success')
    } catch (error) {
      const failureMessage = getAdminErrorMessage(error, 'ลบโปรเจกต์ไม่สำเร็จ')
      await loadProjects()
      setMessage(failureMessage)
      setMessageTone('error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="admin-dashboard-content">
      <div className="admin-page-heading">
        <div><span className="eyebrow">PROJECT LIBRARY</span><h1>Admin Dashboard</h1><p>จัดการโปรเจกต์ ภาพปก และไฟล์เวอร์ชันได้จากที่เดียว</p></div>
        <Link className="btn" href="/admin/projects/new"><span aria-hidden="true">＋</span> เพิ่มโปรเจกต์ใหม่</Link>
      </div>
      {message && <StatusMessage tone={messageTone}>{message}</StatusMessage>}
      <div className="admin-list-heading"><div><h2>โปรเจกต์ทั้งหมด</h2><span>{loading ? 'กำลังโหลด…' : `${projects.length} โปรเจกต์`}</span></div><button className="admin-refresh-button" type="button" onClick={() => void loadProjects()} disabled={loading || deleting}>รีเฟรชรายการ</button></div>
      {loading ? (
        <div className="admin-empty-state" role="status"><span className="admin-loading-dot" />กำลังโหลดโปรเจกต์จาก Supabase…</div>
      ) : projects.length ? (
        <div className="admin-project-list">{projects.map((project) => <AdminProjectCard key={project.id} project={project} onDelete={deleteProject} />)}</div>
      ) : (
        <div className="admin-empty-state"><span className="admin-empty-icon" aria-hidden="true">＋</span><h2>ยังไม่มีโปรเจกต์</h2><p>สร้างโปรเจกต์แรกของคุณ แล้วโปรเจกต์จะปรากฏบนหน้า Works</p><Link className="btn secondary" href="/admin/projects/new">เพิ่มโปรเจกต์ใหม่</Link></div>
      )}
    </section>
  )
}
