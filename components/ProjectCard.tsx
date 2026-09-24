import Link from 'next/link'
import type { Project } from '@/lib/projects'

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const hasImage = project.coverLabel.startsWith('http')
  const latestVersion = project.files[0]?.version

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="project-card reveal"
      style={{ animationDelay: `${Math.min(index, 5) * 70}ms` }}
    >
      <div className="project-cover">
        {hasImage ? (
          // The cover URL comes from existing project data and may be hosted outside this app.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.coverLabel} alt={`ภาพปก ${project.title}`} loading="lazy" />
        ) : (
          <div className="cover-placeholder" aria-label={`ภาพปก ${project.title}`}>
            <span className="cover-orb" aria-hidden="true" />
            <span>{project.coverLabel}</span>
          </div>
        )}
        <span className="cover-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="project-card-body">
        <div className="project-card-topline">
          <span className="eyebrow">PROJECT</span>
          {latestVersion && <span className="version-chip">v{latestVersion}</span>}
        </div>
        <h3>{project.title}</h3>
        {project.shortDescription && <p className="project-summary">{project.shortDescription}</p>}
        <div className="project-card-bottom">
          <span className="meta">อัปเดตล่าสุด {project.updatedAt}</span>
          <span className="card-link-label">ดูรายละเอียด <span aria-hidden="true">→</span></span>
        </div>
      </div>
    </Link>
  )
}
