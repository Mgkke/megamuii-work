import Link from 'next/link'
import { ProjectCard } from '@/components/ProjectCard'
import { listProjects } from '@/lib/data'

export const dynamic = 'force-dynamic'

const features = [
  { icon: '✳', title: 'Mods & Projects', copy: 'รวมผลงานและม็อดที่สร้างขึ้นด้วยความตั้งใจ' },
  { icon: '↓', title: 'Easy Download', copy: 'อ่านรายละเอียดและดาวน์โหลดได้ในที่เดียว' },
  { icon: '↻', title: 'Always Updated', copy: 'ติดตามเวอร์ชันและวันที่อัปเดตล่าสุดได้ง่าย ๆ' }
]

export default async function Home() {
  const projects = await listProjects()
  const latestProjects = projects.slice(0, 3)
  const featured = latestProjects[0]

  return (
    <main>
      <section className="hero-section">
        <div className="container hero-layout">
          <div className="hero-copy reveal">
            <span className="eyebrow hero-badge"><span className="status-dot" /> MODS · PROJECTS · DOWNLOADS</span>
            <h1>ผลงานของ <span>Megamuii</span></h1>
            <p>พื้นที่รวมม็อด โปรเจกต์ และผลงานที่สร้างขึ้นด้วยตัวเอง พร้อมรายละเอียด วิธีติดตั้ง และไฟล์ดาวน์โหลดที่หาได้ง่ายในที่เดียว</p>
            <div className="hero-actions">
              <Link className="btn" href="/works">ดูผลงานทั้งหมด <span aria-hidden="true">→</span></Link>
              <Link className="text-action" href={featured ? `/projects/${featured.slug}` : '/works'}>ผลงานล่าสุด <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="hero-caption"><span className="caption-line" /> สร้างด้วยใจ แชร์ให้ทุกคน</div>
          </div>

          <div className="hero-art reveal" aria-label="ตัวอย่างผลงานและไฟล์ดาวน์โหลด">
            <span className="hero-grid" aria-hidden="true" />
            <span className="hero-blob hero-blob-green" aria-hidden="true" />
            <span className="hero-blob hero-blob-blue" aria-hidden="true" />
            <div className="floating-tag tag-mods"><span className="tag-dot green-dot" /> Made with care</div>
            <div className="floating-tag tag-download"><span className="download-mini" aria-hidden="true">↓</span> Ready to download</div>
            <div className="showcase-card">
              <div className="showcase-cover">
                {featured?.coverLabel.startsWith('http') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.coverLabel} alt="" />
                ) : <span className="showcase-cover-mark" aria-hidden="true">mw</span>}
                <span className="showcase-sticker">LATEST<br />WORK</span>
              </div>
              <div className="showcase-info">
                <div><span className="eyebrow">FEATURED PROJECT</span><strong>{featured?.title ?? 'Creative projects'}</strong></div>
                <span className="showcase-download" aria-hidden="true">↓</span>
              </div>
            </div>
            <span className="hero-sparkle sparkle-one" aria-hidden="true">✳</span>
            <span className="hero-sparkle sparkle-two" aria-hidden="true">✦</span>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="container">
          <div className="section-heading centered reveal">
            <span className="eyebrow">A LITTLE ABOUT THIS SPACE</span>
            <h2>สร้าง แบ่งปัน และอัปเดต</h2>
            <p>ทุกอย่างที่ต้องใช้เพื่อเริ่มต้นกับผลงาน อยู่พร้อมให้คุณแล้ว</p>
          </div>
          <div className="feature-grid">
            {features.map((feature, index) => (
              <article className="feature-card reveal" style={{ animationDelay: `${index * 80}ms` }} key={feature.title}>
                <span className={`feature-icon feature-icon-${index}`} aria-hidden="true">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section latest-section">
        <div className="container">
          <div className="section-heading-row reveal">
            <div className="section-heading">
              <span className="eyebrow">FRESH FROM THE WORKSHOP</span>
              <h2>ผลงานล่าสุด</h2>
              <p>เลือกชมโปรเจกต์ล่าสุด แล้วดาวน์โหลดไปลองได้เลย</p>
            </div>
            <Link href="/works" className="outline-link">ดูผลงานทั้งหมด <span aria-hidden="true">→</span></Link>
          </div>
          {latestProjects.length ? (
            <div className="project-grid">
              {latestProjects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
            </div>
          ) : (
            <div className="empty-state"><span aria-hidden="true">✳</span><h3>ผลงานใหม่กำลังจะมา</h3><p>แวะกลับมาดูอีกครั้งเร็ว ๆ นี้นะ</p></div>
          )}
          <div className="mobile-all-link"><Link href="/works" className="btn secondary">ดูผลงานทั้งหมด <span aria-hidden="true">→</span></Link></div>
        </div>
      </section>
    </main>
  )
}
