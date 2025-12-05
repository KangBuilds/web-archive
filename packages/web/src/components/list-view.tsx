import type { Page } from '@web-archive/shared/types'
import React, { useState } from 'react'
import { useMouse } from 'ahooks'
import { Calendar } from 'lucide-react'
import ScreenshotView from './screenshot-view'

interface ListViewProps {
  pages?: Page[]
  children?: (page: Page) => React.ReactNode
  imgPreview?: boolean
  onItemClick?: (page: Page, event: React.MouseEvent) => void
}

function ListView({ pages, children, imgPreview, onItemClick }: ListViewProps) {
  const mouse = useMouse()
  const [prevScreenshotId, setPrevScreenshotId] = useState<string | null>(null)

  const handleClickPage = (page: Page, event: React.MouseEvent) => {
    onItemClick?.(page, event)
  }

  const handleHoverPage = (e: React.MouseEvent, page: Page) => {
    if (imgPreview) {
      setPrevScreenshotId(page.screenshotId ?? null)
    }
  }

  const handleLeavePage = () => {
    setPrevScreenshotId(null)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className="space-y-1">
      {/* Floating preview image */}
      {prevScreenshotId && (
        <div
          className="fixed z-50 pointer-events-none animate-fade-in"
          style={{
            top: mouse.pageY + 12,
            left: mouse.pageX + 12,
          }}
        >
          <ScreenshotView
            screenshotId={prevScreenshotId}
            className="w-64 rounded-lg shadow-soft-lg border border-border/50"
            loadingClassName="w-64 h-40 rounded-lg"
          />
        </div>
      )}

      {/* List items */}
      {pages?.map((page, index) => (
        <div
          key={page.id}
          className="group flex items-center justify-between gap-4 p-4 rounded-lg bg-card border border-transparent hover:border-border/50 hover:shadow-soft cursor-pointer transition-all animate-fade-up"
          style={{ animationDelay: `${index * 30}ms` }}
          onClick={e => handleClickPage(page, e)}
          onMouseEnter={e => handleHoverPage(e, page)}
          onMouseLeave={handleLeavePage}
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {page.title}
            </h3>
            {page.pageDesc && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                {page.pageDesc}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(page.createdAt)}</span>
            </div>

            {children && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {children(page)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ListView
