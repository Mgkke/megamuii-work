import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Megamuii Works',
  description: 'Mods, projects and downloads by Megamuii'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <header className="nav">
          <div className="container nav-inner">
            <Link href="/" className="brand">Megamuii Works</Link>
            <nav className="nav-links">
              <Link className="nav-pill hide-mobile" href="/">ผลงาน</Link>
              <Link className="nav-pill" href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="footer">
          <div className="container">© 2026 Megamuii · Mods, projects & downloads</div>
        </footer>
      </body>
    </html>
  )
}
