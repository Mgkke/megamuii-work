import Link from 'next/link'
import { listProjects } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const projects = await listProjects()
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="hero-card">
            <span className="kicker">MODS · PROJECTS · DOWNLOADS</span>
            <h1>ผลงานของ<br />Megamuii</h1>
            <p>พื้นที่รวมม็อดและโปรเจกต์ที่ทำขึ้นด้วยตัวเอง พร้อมรายละเอียด วิธีติดตั้ง ไฟล์ดาวน์โหลด และวันที่อัปเดตล่าสุดในแต่ละผลงาน</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>ผลงานล่าสุด</h2>
              <p>กดที่การ์ดเพื่อดูรายละเอียดและดาวน์โหลด</p>
            </div>
          </div>

          <div className="grid">
            {projects.map((project) => (
              <Link key={project.slug} href={`/projects/${project.slug}`} className="card">
                {project.coverLabel.startsWith('http') ? (
                  <div className="card-cover" style={{ backgroundImage: `url(${project.coverLabel})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                ) : (
                  <div className="card-cover">{project.coverLabel}</div>
                )}
                <div className="card-body">
                  <h3 className="card-title">{project.title}</h3>
                  <p className="meta">อัปเดตล่าสุด {project.updatedAt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
