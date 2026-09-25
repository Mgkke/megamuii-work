'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { AdminProject } from './admin-utils'
import { formatAdminDate } from './admin-utils'
import { ConfirmDialog } from './AdminControls'

export function AdminProjectCard({ project, onDelete }: { project: AdminProject; onDelete: (project: AdminProject) => Promise<void> }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const latest = useMemo(() => [...(project.project_files ?? [])].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0], [project.project_files])

  async function confirmDelete() {
    setBusy(true)
    try {
      await onDelete(project)
      setConfirmOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <article className="admin-project-card">
        <div className="admin-project-cover">
          {project.cover_url ? <img src={project.cover_url} alt={`ภาพปก ${project.title}`} /> : <div className="admin-cover-placeholder"><span aria-hidden="true">m</span><strong>{project.title}</strong></div>}
        </div>
        <div className="admin-project-content">
          <div className="admin-project-heading">
            <div><h3>{project.title}</h3><p className="admin-project-slug">/{project.slug}</p></div>
            {latest && <span className="version-chip">v{latest.version}</span>}
          </div>
          <p className="admin-project-meta">อัปเดต {formatAdminDate(project.updated_at)} <span aria-hidden="true">·</span> {project.project_files?.length ?? 0} เวอร์ชัน</p>
          <div className="admin-project-actions">
            <Link className="btn secondary" href={`/admin/projects/${project.id}/edit`}>แก้ไขโปรเจกต์</Link>
            <Link className="btn admin-blue-button" href={`/admin/projects/${project.id}/versions`}>จัดการเวอร์ชัน</Link>
            <button className="btn danger-outline" type="button" onClick={() => setConfirmOpen(true)}>ลบโปรเจกต์</button>
          </div>
        </div>
      </article>
      <ConfirmDialog
        open={confirmOpen}
        title={`ลบ “${project.title}”?`}
        typedPhrase={project.title}
        confirmLabel="ลบโปรเจกต์ถาวร"
        busy={busy}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      >
        <p>การลบนี้จะนำข้อมูลโปรเจกต์ ประวัติเวอร์ชัน ไฟล์ดาวน์โหลด และภาพปกออกอย่างถาวร</p>
        <p>พิมพ์ชื่อโปรเจกต์ให้ตรงเพื่อยืนยัน</p>
      </ConfirmDialog>
    </>
  )
}
