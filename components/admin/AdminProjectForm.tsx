'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { useAdmin } from './AdminShell'
import { StatusMessage } from './AdminControls'
import { deleteAdminFile, deleteAdminFileIfUnreferenced, getAdminErrorMessage, slugifyProjectTitle, uploadAdminFile, type AdminProject } from './admin-utils'

export function AdminProjectForm({ project }: { project?: AdminProject }) {
  const { supabase } = useAdmin()
  const editing = Boolean(project)
  const [title, setTitle] = useState(project?.title ?? '')
  const [slug, setSlug] = useState(project?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(editing)
  const [shortDescription, setShortDescription] = useState(project?.short_description ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [installation, setInstallation] = useState((project?.installation ?? []).join('\n'))
  const [version, setVersion] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [downloadFile, setDownloadFile] = useState<File | null>(null)
  const [progress, setProgress] = useState('')
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'success' | 'error' | 'info'>('info')
  const [saving, setSaving] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [coverPreview, setCoverPreview] = useState('')
  const [currentCoverUrl, setCurrentCoverUrl] = useState(project?.cover_url ?? null)

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview('')
      return
    }
    const url = URL.createObjectURL(coverFile)
    setCoverPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [coverFile])

  function updateTitle(value: string) {
    setTitle(value)
    if (!slugTouched) setSlug(slugifyProjectTitle(value))
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    const normalizedTitle = title.trim()
    const normalizedSlug = slug.trim().toLowerCase()
    if (!normalizedTitle || !normalizedSlug) {
      setMessageTone('error')
      setMessage('กรุณากรอกชื่อและ Slug ของโปรเจกต์')
      return
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
      setMessageTone('error')
      setMessage('Slug ใช้ได้เฉพาะ a-z, 0-9 และขีดกลาง โดยห้ามขึ้นต้นหรือลงท้ายด้วยขีด')
      return
    }
    if (!editing && (!version.trim() || !downloadFile || !coverFile)) {
      setMessageTone('error')
      setMessage('กรุณาระบุเวอร์ชัน เลือกภาพปก และเลือกไฟล์ดาวน์โหลดให้ครบ')
      return
    }
    if (coverFile?.type && !coverFile.type.startsWith('image/')) {
      setMessageTone('error')
      setMessage('ไฟล์ภาพปกต้องเป็นไฟล์รูปภาพ')
      return
    }

    setSaving(true)
    let newCover: { path: string; url: string } | null = null
    let newDownload: { path: string; url: string } | null = null
    let createdProjectId: string | null = null
    try {
      if (editing && project) {
        const previousCoverUrl = currentCoverUrl
        let nextCoverUrl = currentCoverUrl
        if (coverFile) {
          setProgress('กำลังอัปโหลดภาพปกใหม่…')
          newCover = await uploadAdminFile(supabase, 'covers', normalizedSlug, coverFile)
          nextCoverUrl = newCover.url
        }

        setProgress('กำลังบันทึกข้อมูลโปรเจกต์…')
        const { data, error } = await supabase.from('projects').update({
          title: normalizedTitle,
          slug: normalizedSlug,
          short_description: shortDescription.trim(),
          description: description.trim(),
          installation: installation.split('\n').map((line) => line.trim()).filter(Boolean),
          cover_url: nextCoverUrl
        }).eq('id', project.id).select('id').maybeSingle()
        if (error) throw error
        if (!data) throw new Error('ไม่พบโปรเจกต์นี้ หรือไม่มีสิทธิ์แก้ไข')

        if (newCover) {
          if (previousCoverUrl) {
            try {
              const result = await deleteAdminFileIfUnreferenced(supabase, 'covers', previousCoverUrl, { projectId: project.id })
              setMessage(result === 'removed' ? 'บันทึกข้อมูลและเปลี่ยนภาพปกเรียบร้อยแล้ว' : result === 'shared' ? 'เปลี่ยนภาพปกแล้ว แต่ภาพเดิมยังถูกใช้โดยโปรเจกต์อื่น จึงเก็บไฟล์ไว้' : 'บันทึกแล้ว แต่ไม่พบ Storage path ที่ปลอดภัยสำหรับลบภาพปกเดิม')
            } catch {
              setMessage('บันทึกแล้ว แต่ลบภาพปกเดิมไม่สำเร็จ ภาพปกใหม่กำลังใช้งานอยู่')
            }
          } else {
            setMessage('บันทึกข้อมูลและเปลี่ยนภาพปกเรียบร้อยแล้ว')
          }
          setCurrentCoverUrl(nextCoverUrl)
          setCoverFile(null)
          setFileInputKey((value) => value + 1)
        } else {
          setMessage('บันทึกข้อมูลโปรเจกต์เรียบร้อยแล้ว')
        }
        setMessageTone('success')
      } else {
        setProgress('กำลังอัปโหลดภาพปก…')
        newCover = await uploadAdminFile(supabase, 'covers', normalizedSlug, coverFile!)

        setProgress('กำลังสร้างข้อมูลโปรเจกต์…')
        const { data: created, error: projectError } = await supabase.from('projects').insert({
          title: normalizedTitle,
          slug: normalizedSlug,
          short_description: shortDescription.trim(),
          description: description.trim(),
          installation: installation.split('\n').map((line) => line.trim()).filter(Boolean),
          cover_url: newCover.url
        }).select('id').single()
        if (projectError) throw projectError
        createdProjectId = created.id

        setProgress('กำลังอัปโหลดไฟล์ดาวน์โหลด…')
        newDownload = await uploadAdminFile(supabase, 'downloads', normalizedSlug, downloadFile!)

        setProgress('กำลังเผยแพร่เวอร์ชันแรก…')
        const { error: fileError } = await supabase.from('project_files').insert({
          project_id: createdProjectId,
          version: version.trim(),
          file_name: downloadFile!.name,
          file_url: newDownload.url,
          file_size: downloadFile!.size
        })
        if (fileError) throw fileError

        setMessage('สร้างและเผยแพร่โปรเจกต์เรียบร้อยแล้ว')
        setMessageTone('success')
        setTitle('')
        setSlug('')
        setSlugTouched(false)
        setShortDescription('')
        setDescription('')
        setInstallation('')
        setVersion('')
        setCoverFile(null)
        setDownloadFile(null)
        setFileInputKey((value) => value + 1)
      }
    } catch (error) {
      const cleanupErrors: string[] = []
      if (!editing) {
        if (newDownload) {
          try { await deleteAdminFile(supabase, 'downloads', newDownload.url) } catch { cleanupErrors.push('ลบไฟล์ดาวน์โหลดที่อัปโหลดไว้ไม่สำเร็จ') }
        }
        if (createdProjectId) {
          const { error: cleanupError } = await supabase.from('projects').delete().eq('id', createdProjectId)
          if (cleanupError) cleanupErrors.push('ลบข้อมูลโปรเจกต์ที่สร้างค้างไว้ไม่สำเร็จ')
        }
        if (newCover) {
          try { await deleteAdminFile(supabase, 'covers', newCover.url) } catch { cleanupErrors.push('ลบภาพปกที่อัปโหลดไว้ไม่สำเร็จ') }
        }
      } else if (newCover) {
        try { await deleteAdminFile(supabase, 'covers', newCover.url) } catch { cleanupErrors.push('ลบภาพปกใหม่ที่ยังไม่ได้บันทึกไม่สำเร็จ') }
      }
      setMessageTone('error')
      setMessage([getAdminErrorMessage(error, 'บันทึกโปรเจกต์ไม่สำเร็จ'), ...cleanupErrors].join(' · '))
    } finally {
      setSaving(false)
      setProgress('')
    }
  }

  return (
    <section className="panel admin-form-panel">
      <div className="admin-panel-heading">
        <div><span className="eyebrow">{editing ? 'PROJECT SETTINGS' : 'NEW PROJECT'}</span><h2>{editing ? 'แก้ไขโปรเจกต์' : 'เพิ่มโปรเจกต์ใหม่'}</h2></div>
        <Link className="admin-back-link" href="/admin">กลับหน้าแดชบอร์ด</Link>
      </div>
      <form className="form admin-project-form" onSubmit={saveProject}>
        <div className="admin-cover-edit-preview">
          {(coverPreview || currentCoverUrl) ? <img src={coverPreview || currentCoverUrl || ''} alt="ตัวอย่างภาพปกโปรเจกต์" /> : <div className="admin-cover-placeholder"><span aria-hidden="true">m</span><strong>ภาพปกโปรเจกต์</strong></div>}
          <div><strong>{coverFile?.name || (currentCoverUrl ? 'ภาพปกปัจจุบัน' : 'ยังไม่ได้เลือกภาพปก')}</strong><span>อัปโหลดไฟล์ภาพเพื่อใช้เป็นภาพปก</span></div>
        </div>
        <div className="admin-form-grid">
          <div className="field"><label htmlFor="project-title">ชื่อโปรเจกต์</label><input id="project-title" value={title} onChange={(event) => updateTitle(event.target.value)} maxLength={160} required /></div>
          <div className="field"><label htmlFor="project-slug">Slug</label><input id="project-slug" value={slug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value) }} maxLength={100} autoComplete="off" required /><span className="field-hint">URL สาธารณะ: /projects/{slug || 'project-slug'}</span></div>
        </div>
        <div className="field"><label htmlFor="project-short-description">คำอธิบายสั้น</label><input id="project-short-description" value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} maxLength={280} /></div>
        <div className="field"><label htmlFor="project-description">รายละเอียด</label><textarea id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={5} /></div>
        <div className="field"><label htmlFor="project-installation">วิธีติดตั้ง <span className="field-hint">หนึ่งขั้นตอนต่อหนึ่งบรรทัด</span></label><textarea id="project-installation" value={installation} onChange={(event) => setInstallation(event.target.value)} rows={5} /></div>
        <div className="admin-form-grid">
          <div className="field"><label htmlFor="project-cover">{editing ? 'เปลี่ยนภาพปก' : 'ภาพปก'}</label><input key={`cover-${fileInputKey}`} id="project-cover" type="file" accept="image/*" required={!editing} onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)} /></div>
          {!editing && <div className="field"><label htmlFor="project-version">เวอร์ชันแรก</label><input id="project-version" value={version} onChange={(event) => setVersion(event.target.value)} placeholder="0.1.0" maxLength={40} required /></div>}
        </div>
        {!editing && <div className="field"><label htmlFor="project-download">ไฟล์ดาวน์โหลด</label><input key={`download-${fileInputKey}`} id="project-download" type="file" required onChange={(event) => setDownloadFile(event.target.files?.[0] ?? null)} /><span className="field-hint">ไฟล์ที่เลือก: {downloadFile?.name ?? 'ยังไม่ได้เลือกไฟล์'}</span></div>}
        {message && <StatusMessage tone={messageTone}>{message}</StatusMessage>}
        {saving && progress && <StatusMessage>{progress}</StatusMessage>}
        <div className="admin-form-actions"><button className="btn" type="submit" disabled={saving}>{saving ? 'กำลังบันทึก…' : editing ? 'บันทึกการแก้ไข' : 'สร้างและเผยแพร่โปรเจกต์'}</button>{editing && <Link className="btn secondary" href={`/admin/projects/${project?.id}/versions`}>ไปจัดการเวอร์ชัน</Link>}</div>
      </form>
    </section>
  )
}
