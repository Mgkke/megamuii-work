import { ProjectCard } from '@/components/ProjectCard'
import { listProjects } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function WorksPage() {
  const projects = await listProjects()

  return (
    <main className="works-page page-shell">
      <section className="container">
        <div className="page-heading reveal">
          <span className="eyebrow">THE PROJECT LIBRARY</span>
          <h1>ผลงานทั้งหมด</h1>
          <p>รวมม็อดและโปรเจกต์ทั้งหมดของ Megamuii พร้อมรายละเอียดและไฟล์ดาวน์โหลด</p>
        </div>
        {projects.length ? (
          <div className="project-grid works-grid">
            {projects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}
          </div>
        ) : (
          <div className="empty-state"><span aria-hidden="true">✳</span><h2>ยังไม่มีผลงานในตอนนี้</h2><p>โปรเจกต์ใหม่จะปรากฏที่นี่เมื่อพร้อมให้ดาวน์โหลด</p></div>
        )}
      </section>
    </main>
  )
}
