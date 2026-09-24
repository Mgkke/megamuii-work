import type { Metadata } from 'next'
import './globals.css'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'Megamuii Works — Mods, Projects & Downloads',
  description: 'พื้นที่รวมม็อด โปรเจกต์ และผลงานดาวน์โหลดจาก Megamuii'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
