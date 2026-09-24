import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="Megamuii Works — หน้าหลัก">
          <span className="brand-mark" aria-hidden="true">m</span>
          <span>Megamuii <span className="brand-light">Works</span></span>
        </Link>
        <nav className="nav-links" aria-label="เมนูหลัก">
          <Link className="nav-link" href="/">หน้าหลัก</Link>
          <Link className="nav-link" href="/works">ผลงาน</Link>
          <Link className="nav-link nav-admin" href="/admin">Admin <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  )
}
