'use client'

import Link from 'next/link'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type PropsWithChildren } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase'

type AccessState = 'loading' | 'signed-out' | 'checking' | 'admin' | 'denied' | 'config-error' | 'auth-error'
type AdminContextValue = { supabase: SupabaseClient; session: Session }

const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) throw new Error('useAdmin must be used inside AdminShell')
  return context
}

export function AdminShell({ children }: PropsWithChildren) {
  const { supabase, setupError } = useMemo(() => {
    try {
      return { supabase: getSupabaseBrowserClient(), setupError: '' }
    } catch {
      return { supabase: null, setupError: 'ยังไม่ได้ตั้งค่า Supabase ใน environment ของเว็บไซต์' }
    }
  }, [])
  const [session, setSession] = useState<Session | null>(null)
  const sessionUserId = useRef<string | null>(null)
  const [access, setAccess] = useState<AccessState>(supabase ? 'loading' : 'config-error')
  const [message, setMessage] = useState(setupError)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) {
        setMessage(error.message)
        setAccess('auth-error')
        return
      }
      setSession(data.session)
      sessionUserId.current = data.session?.user.id ?? null
      setAccess(data.session ? 'checking' : 'signed-out')
    }).catch((error: unknown) => {
      if (!active) return
      setMessage(error instanceof Error ? error.message : 'ตรวจสอบสถานะการเข้าสู่ระบบไม่สำเร็จ')
      setAccess('auth-error')
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      const sameUser = Boolean(nextSession && nextSession.user.id === sessionUserId.current)
      sessionUserId.current = nextSession?.user.id ?? null
      setSession(nextSession)
      setAccess((current) => !nextSession ? 'signed-out' : sameUser && current === 'admin' ? 'admin' : 'checking')
      if (!sameUser) setMessage('')
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [supabase])

  const authenticatedUserId = session?.user.id

  useEffect(() => {
    if (!supabase || !authenticatedUserId) return
    let active = true
    setAccess('checking')
    Promise.resolve(supabase.from('admin_users').select('user_id').eq('user_id', authenticatedUserId).maybeSingle()).then(({ data, error }) => {
      if (!active) return
      if (error) {
        setMessage(error.message)
        setAccess('auth-error')
      } else {
        setAccess(data ? 'admin' : 'denied')
        if (!data) setMessage('บัญชีนี้ยังไม่ได้รับสิทธิ์ผู้ดูแลระบบ')
      }
    }).catch((error: unknown) => {
      if (!active) return
      setMessage(error instanceof Error ? error.message : 'ตรวจสอบสิทธิ์ผู้ดูแลระบบไม่สำเร็จ')
      setAccess('auth-error')
    })
    return () => { active = false }
  }, [authenticatedUserId, supabase])

  const signOut = useCallback(async () => {
    if (!supabase) return
    setBusy(true)
    const { error } = await supabase.auth.signOut()
    setBusy(false)
    if (error) setMessage(error.message)
  }, [supabase])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) setMessage(error.message)
  }

  if (access !== 'admin' || !supabase || !session) {
    const title = access === 'signed-out' ? 'Admin Login' : access === 'denied' ? 'ไม่มีสิทธิ์ผู้ดูแล' : 'กำลังตรวจสอบสิทธิ์'
    return (
      <main className="admin admin-auth-page">
        <div className="container">
          <section className="panel admin-auth-panel" aria-live="polite">
            <span className="eyebrow">MEGAMUII WORKS · ADMIN</span>
            <h1>{title}</h1>
            {access === 'signed-out' && <p className="meta">เข้าสู่ระบบด้วยบัญชีผู้ดูแลเว็บไซต์</p>}
            {(access === 'loading' || access === 'checking') && <p className="note" role="status">กำลังตรวจสอบบัญชีและสิทธิ์ผู้ดูแล…</p>}
            {access === 'config-error' && <p className="note note-error" role="alert">{message}</p>}
            {access === 'auth-error' && <p className="note note-error" role="alert">{message}</p>}
            {access === 'denied' && <p className="note note-error" role="alert">{message}</p>}
            {access === 'signed-out' && (
              <form className="form" onSubmit={login}>
                <div className="field"><label htmlFor="admin-email">Email</label><input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required /></div>
                <div className="field"><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></div>
                {message && <p className="note note-error" role="alert">{message}</p>}
                <button className="btn" disabled={busy}>{busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}</button>
              </form>
            )}
            {(access === 'denied' || access === 'auth-error') && <button className="btn secondary admin-auth-logout" disabled={busy} onClick={signOut}>ออกจากระบบ</button>}
          </section>
        </div>
      </main>
    )
  }

  return (
    <AdminContext.Provider value={{ supabase, session }}>
      <main className="admin">
        <div className="container">
          <div className="admin-topbar">
            <div>
              <Link href="/admin" className="admin-back-link">Megamuii Works <span aria-hidden="true">/</span> Admin</Link>
              <p className="admin-account">เข้าสู่ระบบเป็น <strong>{session.user.email}</strong></p>
            </div>
            <button className="btn secondary" disabled={busy} onClick={signOut}>{busy ? 'กำลังออกจากระบบ…' : 'ออกจากระบบ'}</button>
          </div>
          {children}
        </div>
      </main>
    </AdminContext.Provider>
  )
}
