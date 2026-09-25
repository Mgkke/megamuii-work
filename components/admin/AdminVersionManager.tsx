'use client'

import Link from 'next/link'
import { NamedDownloadLink } from '@/components/NamedDownloadLink'
import { normalizeDownloadFilename } from '@/lib/download-filename.mjs'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ConfirmDialog, StatusMessage } from './AdminControls'
import { useAdmin } from './AdminShell'
import { deleteAdminFile, deleteAdminFileIfUnreferenced, formatAdminDate, formatFileSize, getAdminErrorMessage, uploadAdminFile, type AdminProject, type AdminProjectFile } from './admin-utils'

export function AdminVersionManager({ projectId }: { projectId: string }) {
  const { supabase } = useAdmin()
  const [project, setProject] = useState<Pick<AdminProject, 'id' | 'title' | 'slug' | 'cover_url'> | null>(null)
  const [files, setFiles] = useState<AdminProjectFile[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState('')
  const [newFile, setNewFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [busyFileId, setBusyFileId] = useState('')
  const [pendingDelete, setPendingDelete] = useState<AdminProjectFile | null>(null)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'success' | 'error' | 'info'>('info')
  const [fileInputKey, setFileInputKey] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    const [projectResult, filesResult] = await Promise.all([
      supabase.from('projects').select('id,title,slug,cover_url').eq('id', projectId).maybeSingle(),
      supabase.from('project_files').select('id,project_id,version,file_name,file_url,file_size,created_at').eq('project_id', projectId).order('created_at', { ascending: false })
    ])
    if (projectResult.error) setMessage(getAdminErrorMessage(projectResult.error, 'โหลดโปรเจกต์ไม่สำเร็จ'))
    else setProject(projectResult.data as typeof project)
    if (filesResult.error) setMessage(getAdminErrorMessage(filesResult.error, 'โหลดเวอร์ชันไม่สำเร็จ'))
    else setFiles((filesResult.data ?? []) as AdminProjectFile[])
    setLoading(false)
  }, [projectId, supabase])

  useEffect(() => { void load() }, [load])

  async function addVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!project) return
    const normalizedVersion = version.trim()
    if (!normalizedVersion || !newFile?.size) {
      setMessageTone('error')
      setMessage('กรุณากรอกเวอร์ชันและเลือกไฟล์ดาวน์โหลด')
      return
    }

    setSaving(true)
    setMessage('')
    let uploaded: { path: string; url: string } | null = null
    try {
      const { data: duplicate, error: duplicateError } = await supabase.from('project_files').select('id').eq('project_id', project.id).eq('version', normalizedVersion).maybeSingle()
      if (duplicateError) throw duplicateError
      if (duplicate) throw new Error('เวอร์ชันนี้มีอยู่แล้วในโปรเจกต์นี้')

      uploaded = await uploadAdminFile(supabase, 'downloads', project.slug, newFile)
      const { error } = await supabase.from('project_files').insert({
        project_id: project.id,
        version: normalizedVersion,
        file_name: newFile.name,
        file_url: uploaded.url,
        file_size: newFile.size
      })
      if (error) throw error

      const { error: dateError } = await supabase.from('projects').update({ updated_at: new Date().toISOString() }).eq('id', project.id)
      setMessageTone(dateError ? 'info' : 'success')
      setMessage(dateError ? `เพิ่มเวอร์ชันแล้ว แต่บันทึกวันที่อัปเดตโปรเจกต์ไม่สำเร็จ: ${dateError.message}` : `เพิ่มเวอร์ชัน ${normalizedVersion} เรียบร้อยแล้ว`)
      setVersion('')
      setNewFile(null)
      setFileInputKey((current) => current + 1)
      await load()
    } catch (error) {
      if (uploaded) {
        try { await deleteAdminFile(supabase, 'downloads', uploaded.url) } catch { /* Keep the primary error visible; the object can be cleaned up manually. */ }
      }
      setMessageTone('error')
      setMessage(getAdminErrorMessage(error, 'เพิ่มเวอร์ชันไม่สำเร็จ'))
    } finally {
      setSaving(false)
    }
  }

  async function replaceFile(file: AdminProjectFile, replacement: File) {
    if (!project || !replacement.size) {
      setMessageTone('error')
      setMessage('ไฟล์ที่เลือกว่างหรืออ่านไม่ได้')
      return
    }
    setBusyFileId(file.id)
    setMessage('')
    let uploaded: { path: string; url: string } | null = null
    try {
      uploaded = await uploadAdminFile(supabase, 'downloads', project.slug, replacement)
      const { data, error } = await supabase.from('project_files').update({
        file_url: uploaded.url,
        file_name: replacement.name,
        file_size: replacement.size
      }).eq('id', file.id).eq('project_id', project.id).select('id').maybeSingle()
      if (error) throw error
      if (!data) throw new Error('ไม่พบเวอร์ชันนี้ในโปรเจกต์ที่เลือก')

      let cleanupNote = ''
      try {
        const removal = await deleteAdminFileIfUnreferenced(supabase, 'downloads', file.file_url, { fileId: file.id })
        if (removal === 'shared') cleanupNote = ' ไฟล์เดิมยังถูกใช้อยู่กับเวอร์ชันอื่น จึงเก็บ object ไว้.'
        if (removal === 'unmanaged') cleanupNote = ' ไฟล์เดิมไม่ใช่ Storage path ของ Supabase จึงไม่ได้ลบออกนอกระบบนี้.'
      } catch {
        cleanupNote = ' เปลี่ยนไฟล์แล้ว แต่ลบ object เก่าไม่สำเร็จ.'
      }
      setMessageTone(cleanupNote ? 'info' : 'success')
      setMessage(`เปลี่ยนไฟล์ของเวอร์ชัน ${file.version} แล้ว${cleanupNote}`)
      await load()
    } catch (error) {
      if (uploaded) {
        try { await deleteAdminFile(supabase, 'downloads', uploaded.url) } catch { /* Keep the primary error visible; cleanup can be retried. */ }
      }
      setMessageTone('error')
      setMessage(getAdminErrorMessage(error, 'เปลี่ยนไฟล์ไม่สำเร็จ'))
    } finally {
      setBusyFileId('')
    }
  }

  async function deleteVersion(file: AdminProjectFile) {
    if (!project) return
    setBusyFileId(file.id)
    setMessage('')
    try {
      const { data: owned, error: verifyError } = await supabase.from('project_files').select('id,file_url').eq('id', file.id).eq('project_id', project.id).maybeSingle()
      if (verifyError) throw verifyError
      if (!owned) throw new Error('ไม่พบเวอร์ชันนี้ในโปรเจกต์ที่เลือก')
      const { data: currentFiles, error: countError } = await supabase.from('project_files').select('id,created_at').eq('project_id', project.id).order('created_at', { ascending: false })
      if (countError) throw countError
      if (!currentFiles || currentFiles.length <= 1 || !currentFiles.some((current) => current.id === file.id)) {
        throw new Error('โปรเจกต์ต้องมีอย่างน้อยหนึ่งเวอร์ชัน จึงไม่สามารถลบเวอร์ชันสุดท้ายได้')
      }
      const removal = await deleteAdminFileIfUnreferenced(supabase, 'downloads', owned.file_url, { fileId: file.id })
      const { data, error } = await supabase.from('project_files').delete().eq('id', file.id).eq('project_id', project.id).select('id').maybeSingle()
      if (error) throw error
      if (!data) throw new Error('ลบรายการเวอร์ชันไม่สำเร็จ')
      const nextRelease = currentFiles.find((current) => current.id !== file.id)
      if (nextRelease) {
        const { error: dateError } = await supabase.from('projects').update({ updated_at: nextRelease.created_at }).eq('id', project.id)
        if (dateError) throw dateError
      }
      setPendingDelete(null)
      setMessageTone(removal === 'removed' ? 'success' : 'info')
      setMessage(removal === 'removed' ? `ลบเวอร์ชัน ${file.version} และไฟล์เรียบร้อยแล้ว` : removal === 'shared' ? `ลบเวอร์ชัน ${file.version} แล้ว แต่เก็บไฟล์ไว้เพราะเวอร์ชันอื่นยังใช้งานอยู่` : `ลบเวอร์ชัน ${file.version} แล้ว แต่ URL เดิมไม่ใช่ Storage path ที่ปลอดภัยสำหรับลบ`)
      await load()
    } catch (error) {
      setMessageTone('error')
      setMessage(getAdminErrorMessage(error, 'ลบเวอร์ชันไม่สำเร็จ'))
    } finally {
      setBusyFileId('')
    }
  }

  if (loading) return <div className="admin-empty-state" role="status"><span className="admin-loading-dot" />กำลังโหลดเวอร์ชัน…</div>
  if (!project) return <section className="panel"><h1>จัดการเวอร์ชัน</h1><StatusMessage tone="error">{message || 'ไม่พบโปรเจกต์นี้'}</StatusMessage></section>

  return (
    <section className="admin-version-page">
      <div className="admin-page-heading">
        <div><Link className="admin-back-link" href="/admin">← กลับหน้าแดชบอร์ด</Link><span className="eyebrow">RELEASE HISTORY · {project.slug}</span><h1>เวอร์ชันของ {project.title}</h1><p>ไฟล์เรียงจากเวอร์ชันที่เพิ่มล่าสุด</p></div>
        <Link className="btn secondary" href={`/admin/projects/${project.id}/edit`}>แก้ไขโปรเจกต์</Link>
      </div>
      {message && <StatusMessage tone={messageTone}>{message}</StatusMessage>}

      <section className="panel admin-add-version-panel">
        <div className="admin-panel-heading"><div><span className="eyebrow">NEW RELEASE</span><h2>เพิ่มเวอร์ชันใหม่</h2></div></div>
        <form className="admin-form-grid admin-add-version-form" onSubmit={addVersion}>
          <div className="field"><label htmlFor="new-version">เวอร์ชัน</label><input id="new-version" value={version} onChange={(event) => setVersion(event.target.value)} placeholder="0.2.0" maxLength={40} required /></div>
          <div className="field"><label htmlFor="new-version-file">ไฟล์ดาวน์โหลด</label><input key={fileInputKey} id="new-version-file" type="file" required onChange={(event) => setNewFile(event.target.files?.[0] ?? null)} /><span className="field-hint">ไฟล์ที่เลือก: {newFile?.name ?? 'ยังไม่ได้เลือกไฟล์'}</span></div>
          <button className="btn" type="submit" disabled={saving}>{saving ? 'กำลังอัปโหลดและบันทึก…' : 'เพิ่มเวอร์ชัน'}</button>
        </form>
      </section>

      <div className="admin-list-heading"><div><h2>เวอร์ชันทั้งหมด</h2><span>{files.length} เวอร์ชัน</span></div><button className="admin-refresh-button" type="button" onClick={() => void load()} disabled={loading || Boolean(busyFileId)}>รีเฟรชรายการ</button></div>
      {files.length ? (
        <div className="admin-version-list">
          {files.map((file, index) => (
            <article className="admin-version-card" key={file.id}>
              <div className="admin-version-main">
                <span className={`admin-version-index ${index === 0 ? 'is-latest' : ''}`}>{index === 0 ? 'LATEST' : `#${files.length - index}`}</span>
                <div className="admin-version-info"><h3>v{file.version}</h3><p className="admin-version-filename">{normalizeDownloadFilename(file.file_name)}</p><p className="admin-project-meta">{formatAdminDate(file.created_at)} <span aria-hidden="true">·</span> {formatFileSize(file.file_size)}</p></div>
              </div>
              <div className="admin-version-actions">
                <NamedDownloadLink className="btn secondary" href={file.file_url} downloadFileName={file.file_name}>ดาวน์โหลด</NamedDownloadLink>
                <label className={`btn admin-blue-button ${busyFileId === file.id ? 'is-disabled' : ''}`} htmlFor={`replace-file-${file.id}`}>{busyFileId === file.id ? 'กำลังเปลี่ยน…' : 'แทนที่ไฟล์'}<input className="admin-visually-hidden" id={`replace-file-${file.id}`} type="file" disabled={Boolean(busyFileId)} onChange={(event) => { const replacement = event.target.files?.[0]; if (replacement) void replaceFile(file, replacement); event.currentTarget.value = '' }} /></label>
                <button className="btn danger-outline" type="button" disabled={Boolean(busyFileId) || files.length <= 1} title={files.length <= 1 ? 'โปรเจกต์ต้องมีอย่างน้อยหนึ่งเวอร์ชัน' : undefined} onClick={() => setPendingDelete(file)}>ลบเวอร์ชัน</button>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="admin-empty-state"><h2>ยังไม่มีเวอร์ชัน</h2><p>เพิ่มไฟล์เวอร์ชันแรกของโปรเจกต์นี้ได้จากฟอร์มด้านบน</p></div>}

      <ConfirmDialog open={Boolean(pendingDelete)} title={`ลบเวอร์ชัน ${pendingDelete?.version ?? ''}?`} confirmLabel="ลบเวอร์ชัน" busy={Boolean(busyFileId)} onCancel={() => setPendingDelete(null)} onConfirm={() => pendingDelete ? deleteVersion(pendingDelete) : undefined}>
        <p>ระบบจะลบไฟล์ดาวน์โหลดและรายการเวอร์ชันนี้ออกจากโปรเจกต์</p>
      </ConfirmDialog>
    </section>
  )
}
