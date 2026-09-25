'use client'

import { useEffect, useState } from 'react'

export function StatusMessage({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'success' | 'error' }) {
  return <div className={`admin-status admin-status-${tone}`} role={tone === 'error' ? 'alert' : 'status'} aria-live="polite">{children}</div>
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'ยืนยันการลบ',
  typedPhrase,
  busy = false,
  onCancel,
  onConfirm
}: {
  open: boolean
  title: string
  children: React.ReactNode
  confirmLabel?: string
  typedPhrase?: string
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void | Promise<void>
}) {
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (open) setTyped('')
  }, [open, typedPhrase])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [busy, onCancel, open])

  if (!open) return null
  const confirmed = !typedPhrase || typed === typedPhrase

  return (
    <div className="admin-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel() }}>
      <section className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title">
        <span className="eyebrow">ยืนยันรายการ</span>
        <h2 id="admin-dialog-title">{title}</h2>
        <div className="admin-dialog-copy">{children}</div>
        {typedPhrase && <div className="field admin-confirm-field"><label htmlFor="admin-confirm-text">พิมพ์ <strong>{typedPhrase}</strong> เพื่อยืนยัน</label><input id="admin-confirm-text" autoFocus value={typed} onChange={(event) => setTyped(event.target.value)} /></div>}
        <div className="admin-dialog-actions">
          <button className="btn secondary" type="button" disabled={busy} onClick={onCancel}>ยกเลิก</button>
          <button className="btn danger" type="button" disabled={busy || !confirmed} onClick={() => void onConfirm()}>{busy ? 'กำลังดำเนินการ…' : confirmLabel}</button>
        </div>
      </section>
    </div>
  )
}
