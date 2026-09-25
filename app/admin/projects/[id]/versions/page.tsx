'use client'

import { useParams } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { AdminVersionManager } from '@/components/admin/AdminVersionManager'

export default function ProjectVersionsPage() {
  const params = useParams<{ id: string }>()
  return <AdminShell><AdminVersionManager projectId={params.id} /></AdminShell>
}
