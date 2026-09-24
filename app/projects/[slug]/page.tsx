import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const hasImage = project.coverLabel.startsWith('http')
  return (
    <main className="detail">
      <div className="container">
        <div
          className="detail-cover"
          style={hasImage ? { backgroundImage: `url(${project.coverLabel})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {!hasImage && project.coverLabel}
        </div>
        <div className="detail-head">
          <h1>{project.title}</h1>
          <div className="meta">อัปเดตล่าสุด {project.updatedAt}</div>
        </div>

        <div className="content-grid">
          <div className="panel">
            <h3>เกี่ยวกับผลงาน</h3>
            <p>{project.description}</p>
            <h3 style={{ marginTop: 28 }}>วิธีติดตั้ง</h3>
            <ol>{project.installation.map((step) => <li key={step}>{step}</li>)}</ol>
          </div>

          <aside className="panel">
            <h3>ดาวน์โหลด</h3>
            {project.files.map((file, index) => (
              <div className="file-row" key={`${file.version}-${file.fileName}`}>
                <div>
                  <strong>{file.fileName}</strong>
                  <div className="meta">v{file.version} · {file.date}</div>
                </div>
                <a className={index === 0 ? 'btn' : 'btn secondary'} href={file.fileUrl} target="_blank" rel="noreferrer">ดาวน์โหลด</a>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </main>
  )
}
