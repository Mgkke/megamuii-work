import type { AnchorHTMLAttributes, ReactNode } from 'react'

export function DownloadButton({ children, className = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a className={`btn download-button ${className}`.trim()} {...props}>
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
        <path d="M10 2.5v9m0 0 3.5-3.5M10 11.5 6.5 8M3.5 13.5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </a>
  )
}
