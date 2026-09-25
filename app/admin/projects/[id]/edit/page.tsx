'use client'

import { useParams } from 'next/navigation'
import { AdminProjectEditor } from '@/components/admin/AdminProjectEditor'
import { AdminShell } from '@/components/admin/AdminShell'

export default function EditProjectPage() {
  const params = useParams<{ id: string }>()
  return <AdminShell><AdminProjectEditor projectId={params.id} /></AdminShell>
}
