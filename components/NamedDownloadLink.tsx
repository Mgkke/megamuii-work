'use client'

import { useState, type AnchorHTMLAttributes, type MouseEvent } from 'react'
import { normalizeDownloadFilename } from '@/lib/download-filename.mjs'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { downloadFileName: string }

export function NamedDownloadLink({ href, downloadFileName, className = '', onClick, children, ...props }: Props) {
  const [downloading, setDownloading] = useState(false)

  async function downloadFile() {
    if (typeof href !== 'string' || downloading) return
    setDownloading(true)
    let objectUrl: string | null = null
    try {
      const response = await fetch(href)
      if (!response.ok) throw new Error(`Download failed (${response.status})`)
      const blob = await response.blob()
      objectUrl = URL.createObjectURL(blob)
      const temporaryLink = document.createElement('a')
      temporaryLink.href = objectUrl
      temporaryLink.download = normalizeDownloadFilename(downloadFileName)
      temporaryLink.style.display = 'none'
      document.body.append(temporaryLink)
      temporaryLink.click()
      temporaryLink.remove()
      const downloadUrl = objectUrl
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      objectUrl = null
    } catch {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      window.location.assign(href)
    } finally {
      setDownloading(false)
    }
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    void downloadFile()
  }

  return <a href={href} className={className} onClick={handleClick} aria-busy={downloading || undefined} {...props}>{children}</a>
}
