'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase'

export default function AdminPage() {
  const supabase = useMemo(() => {
    try { return getSupabaseBrowserClient() } catch { return null }
  }, [])
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => data.subscription.unsubscribe()
  }, [supabase])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return setMessage('ยังไม่ได้ตั้งค่า Supabase ใน .env.local')
    setBusy(true); setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    setMessage(error ? error.message : 'เข้าสู่ระบบแล้ว')
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !session) return
    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') || '').trim()
    const slug = String(form.get('slug') || '').trim()
    const shortDescription = String(form.get('shortDescription') || '').trim()
    const description = String(form.get('description') || '').trim()
    const installation = String(form.get('installation') || '').split('\n').map(v => v.trim()).filter(Boolean)
    const version = String(form.get('version') || '').trim()
    const cover = form.get('cover') as File
    const workFile = form.get('workFile') as File
    if (!title || !slug || !version || !cover?.size || !workFile?.size) return setMessage('กรอกหัวข้อ Slug Version และเลือกไฟล์ให้ครบ')

    setBusy(true); setMessage('กำลังอัปโหลด...')
    try {
      const safe = slug.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
      const coverPath = `${safe}/${Date.now()}-${cover.name}`
      const filePath = `${safe}/${Date.now()}-${workFile.name}`

      const coverUpload = await supabase.storage.from('covers').upload(coverPath, cover)
      if (coverUpload.error) throw coverUpload.error
      const workUpload = await supabase.storage.from('downloads').upload(filePath, workFile)
      if (workUpload.error) throw workUpload.error

      const coverUrl = supabase.storage.from('covers').getPublicUrl(coverPath).data.publicUrl
      const fileUrl = supabase.storage.from('downloads').getPublicUrl(filePath).data.publicUrl

      const { data: project, error: projectError } = await supabase.from('projects').insert({
        title, slug: safe, short_description: shortDescription, description, installation, cover_url: coverUrl, updated_at: new Date().toISOString()
      }).select('id').single()
      if (projectError) throw projectError

      const { error: fileError } = await supabase.from('project_files').insert({
        project_id: project.id, version, file_name: workFile.name, file_url: fileUrl, file_size: workFile.size
      })
      if (fileError) throw fileError

      event.currentTarget.reset()
      setMessage('เผยแพร่ผลงานเรียบร้อยแล้ว ✓')
    } catch (error: any) {
      setMessage(error?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setBusy(false)
    }
  }

  if (!session) {
    return (
      <main className="admin"><div className="container"><section className="panel" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h2>Admin Login</h2>
        <p className="meta">เข้าสู่ระบบด้วยบัญชีเจ้าของเว็บ</p>
        <form className="form" onSubmit={login}>
          <div className="field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button className="btn" disabled={busy}>{busy ? 'กำลังเข้าสู่ระบบ...' : 'Login'}</button>
          {message && <div className="note">{message}</div>}
        </form>
      </section></div></main>
    )
  }

  return (
    <main className="admin">
      <div className="container">
        <div className="section-head"><div><h2>Admin Dashboard</h2><p>เพิ่มผลงานใหม่ได้จากหน้านี้โดยตรง</p></div><button className="btn secondary" onClick={() => supabase?.auth.signOut()}>Logout</button></div>
        <div className="admin-grid">
          <section className="panel">
            <h3>เพิ่มผลงานใหม่</h3>
            <form className="form" onSubmit={publish}>
              <div className="field"><label>รูปปก</label><input name="cover" type="file" accept="image/*" required /></div>
              <div className="field"><label>หัวข้อ</label><input name="title" placeholder="Dressmaker Thai Mod" required /></div>
              <div className="field"><label>Slug</label><input name="slug" placeholder="dressmaker-thai" required /></div>
              <div className="field"><label>คำอธิบายสั้น</label><input name="shortDescription" placeholder="ข้อความสั้น ๆ สำหรับการ์ด" /></div>
              <div className="field"><label>รายละเอียด</label><textarea name="description" placeholder="รายละเอียดของผลงาน" /></div>
              <div className="field"><label>วิธีติดตั้ง</label><textarea name="installation" placeholder={'หนึ่งขั้นตอนต่อหนึ่งบรรทัด\nเช่น ดาวน์โหลดไฟล์\nแตกไฟล์ลงโฟลเดอร์เกม'} /></div>
              <div className="field"><label>Version</label><input name="version" placeholder="0.1.0" required /></div>
              <div className="field"><label>ไฟล์งาน</label><input name="workFile" type="file" required /></div>
              <button className="btn" disabled={busy}>{busy ? 'กำลังเผยแพร่...' : 'Publish Project'}</button>
              {message && <div className="note">{message}</div>}
            </form>
          </section>
          <section className="panel">
            <h3>วิธีใช้งาน</h3>
            <p>หลังเชื่อม Supabase แล้ว การกด Publish จะอัปโหลดรูปปกและไฟล์งาน สร้างข้อมูลโปรเจกต์ และทำให้การ์ดใหม่ปรากฏที่หน้าแรกอัตโนมัติ</p>
            <div className="note">วันที่ “อัปเดตล่าสุด” จะถูกบันทึกจากเวลาที่ Publish โดยอัตโนมัติ ส่วนการอัปเดตเวอร์ชันของผลงานเดิมจะทำเป็นฟอร์มแยกในรอบถัดไป</div>
          </section>
        </div>
      </div>
    </main>
  )
}
