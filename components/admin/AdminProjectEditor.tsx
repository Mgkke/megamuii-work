'use client'

import { useEffect, useState } from 'react'
import { AdminProjectForm } from './AdminProjectForm'
import { StatusMessage } from './AdminControls'
import { useAdmin } from './AdminShell'
import { getAdminErrorMessage, type AdminProject } from './admin-utils'

export function AdminProjectEditor({ projectId }: { projectId: string }) {
  const { supabase } = useAdmin()
  const [project, setProject] = useState<AdminProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    supabase.from('projects').select('id,title,slug,short_description,description,installation,cover_url,created_at,updated_at')
      .eq('id', projectId).maybeSingle().then(({ data, error }) => {
        if (!active) return
        if (error) setMessage(getAdminErrorMessage(error, 'โหลดโปรเจกต์ไม่สำเร็จ'))
        else if (!data) setMessage('ไม่พบโปรเจกต์นี้ อาจถูกลบไปแล้ว')
        else setProject(data as AdminProject)
        setLoading(false)
      })
    return () => { active = false }
  }, [projectId, supabase])

  if (loading) return <div className="admin-empty-state" role="status"><span className="admin-loading-dot" />กำลังโหลดข้อมูลโปรเจกต์…</div>
  if (!project) return <div className="admin-empty-state"><h1>แก้ไขโปรเจกต์</h1><StatusMessage tone="error">{message || 'ไม่พบโปรเจกต์นี้'}</StatusMessage></div>
  return <AdminProjectForm project={project} />
}
