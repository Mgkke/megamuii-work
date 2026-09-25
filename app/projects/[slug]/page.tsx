import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DownloadButton } from '@/components/DownloadButton'
import { NamedDownloadLink } from '@/components/NamedDownloadLink'
import { getProjectBySlug } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const hasImage = project.coverLabel.startsWith('http')
  const [latestFile, ...previousFiles] = project.files

  return (
    <main className="detail-page page-shell">
      <div className="container">
        <nav className="breadcrumbs reveal" aria-label="เส้นทางนำทาง">
          <Link href="/">หน้าหลัก</Link><span aria-hidden="true">/</span>
          <Link href="/works">ผลงาน</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{project.title}</span>
        </nav>

        <section className="detail-hero reveal">
          <div className="detail-visual">
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.coverLabel} alt={`ภาพปก ${project.title}`} />
            ) : (
              <div className="cover-placeholder detail-placeholder" role="img" aria-label={`ภาพปก ${project.title}`}>
                <span className="cover-orb" aria-hidden="true" />
                <span>{project.coverLabel}</span>
              </div>
            )}
            <span className="detail-image-label"><span className="status-dot" /> MEGAMUII WORKS</span>
          </div>
          <div className="detail-intro">
            <span className="eyebrow">MOD · PROJECT</span>
            <h1>{project.title}</h1>
            <div className="detail-meta-row">
              <span className="meta">อัปเดตล่าสุด {project.updatedAt}</span>
              {latestFile && <span className="version-chip">เวอร์ชันล่าสุด v{latestFile.version}</span>}
            </div>
            {project.shortDescription && <p className="detail-summary">{project.shortDescription}</p>}
            {latestFile ? (
              <DownloadButton href={latestFile.fileUrl} downloadFileName={latestFile.fileName}>
                ดาวน์โหลดเวอร์ชันล่าสุด <span className="button-version">v{latestFile.version}</span>
              </DownloadButton>
            ) : (
              <p className="download-unavailable">ไฟล์ดาวน์โหลดกำลังเตรียมพร้อม</p>
            )}
            {latestFile && <span className="download-caption">ไฟล์ {latestFile.fileName}</span>}
          </div>
        </section>

        <div className="detail-content-grid">
          <div className="detail-main-column">
            <section className="content-panel">
              <div className="panel-heading"><span className="panel-icon green-panel-icon" aria-hidden="true">✳</span><div><span className="eyebrow">ABOUT</span><h2>เกี่ยวกับผลงาน</h2></div></div>
              <p className="long-copy">{project.description || project.shortDescription || 'รายละเอียดของผลงานนี้กำลังจะมาเร็ว ๆ นี้'}</p>
            </section>

            <section className="content-panel installation-panel">
              <div className="panel-heading"><span className="panel-icon blue-panel-icon" aria-hidden="true">↗</span><div><span className="eyebrow">GETTING STARTED</span><h2>วิธีติดตั้ง</h2></div></div>
              {project.installation.length ? (
                <ol className="installation-list">
                  {project.installation.map((step, index) => <li key={`${index}-${step}`}><span className="step-number">{String(index + 1).padStart(2, '0')}</span><span>{step}</span></li>)}
                </ol>
              ) : <p className="long-copy">ยังไม่มีรายละเอียดวิธีติดตั้ง</p>}
            </section>
          </div>

          <aside className="download-panel">
            <div className="panel-heading"><span className="panel-icon green-panel-icon" aria-hidden="true">↓</span><div><span className="eyebrow">DOWNLOAD</span><h2>ดาวน์โหลด</h2></div></div>
            {latestFile ? (
              <div className="latest-file-card">
                <span className="latest-label"><span className="status-dot" /> เวอร์ชันล่าสุด</span>
                <h3>{latestFile.fileName}</h3>
                <p className="meta">v{latestFile.version} <span aria-hidden="true">·</span> {latestFile.date}</p>
                <DownloadButton className="file-download-button" href={latestFile.fileUrl} downloadFileName={latestFile.fileName}>ดาวน์โหลดไฟล์</DownloadButton>
              </div>
            ) : (
              <div className="no-files"><p>ยังไม่มีไฟล์ดาวน์โหลดสำหรับผลงานนี้</p></div>
            )}
            {previousFiles.length > 0 && (
              <div className="previous-versions">
                <h3>เวอร์ชันก่อนหน้า</h3>
                {previousFiles.map((file) => (
                  <div className="version-row" key={`${file.version}-${file.fileName}`}>
                    <div className="version-row-info"><strong>v{file.version}</strong><span>{file.fileName}</span><span className="meta">{file.date}</span></div>
                    <NamedDownloadLink className="version-download" href={file.fileUrl} downloadFileName={file.fileName} aria-label={`ดาวน์โหลด ${file.fileName}`}>↓</NamedDownloadLink>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}
