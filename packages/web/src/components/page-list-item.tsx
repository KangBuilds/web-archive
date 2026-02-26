import { Suspense, lazy, memo, useContext, useEffect, useState } from 'react'
import { ExternalLink, Pencil, Share2, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import type { Page } from '@web-archive/shared/types'
import { Badge } from '@web-archive/shared/components/ui/badge'
import { Button } from '@web-archive/shared/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@web-archive/shared/components/ui/tooltip'
import TagContext from '~/store/tag'
import { Link } from '~/router'
import ScreenshotView from '~/components/screenshot-view'

const CardEditDialog = lazy(() => import('~/components/card-edit-dialog'))
const ShareDialog = lazy(() => import('~/components/share-dialog'))

interface PageListItemProps {
  page: Page
  onDelete?: (page: Page) => void
}

function PageListItemComponent({ page, onDelete }: PageListItemProps) {
  const queryClient = useQueryClient()
  const { tagCache, refreshTagCache } = useContext(TagContext)
  const bindTags = tagCache?.filter(tag => tag.pageIds.includes(page.id)) ?? []

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  useEffect(() => {
    queryClient.setQueryData(['page-detail', page.id], page)
  }, [queryClient, page])

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      onDelete?.(page)
    }
  }

  const handleOpenOriginal = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(page.pageUrl, '_blank')
  }

  const handleEdit = () => {
    refreshTagCache()
    setEditDialogOpen(true)
  }

  const handleShare = () => {
    setShareDialogOpen(true)
  }

  return (
    <>
      {editDialogOpen && (
        <Suspense fallback={null}>
          <CardEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            pageId={page.id}
          />
        </Suspense>
      )}
      {shareDialogOpen && (
        <Suspense fallback={null}>
          <ShareDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            pageId={page.id}
            pageTitle={page.title}
          />
        </Suspense>
      )}

      <div className="group flex items-center gap-4 rounded-lg border bg-card p-3 transition-all hover:shadow-md">
        <Link
          to="/page/:slug"
          params={{ slug: page.id.toString() }}
          className="flex flex-1 min-w-0 items-center gap-4"
        >
          {/* Thumbnail */}
          <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            <ScreenshotView
              screenshotId={page.screenshotId}
              className="h-full w-full object-cover"
              loadingClassName="h-full w-full"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="line-clamp-1 font-semibold leading-tight transition-colors group-hover:text-primary">
              {page.title}
            </h3>

            {page.pageDesc && (
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                {page.pageDesc}
              </p>
            )}

            {bindTags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {bindTags.slice(0, 5).map(tag => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-xs font-normal"
                    style={{ borderColor: tag.color, color: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {bindTags.length > 5 && (
                  <Badge variant="outline" className="text-xs font-normal">
                    +
                    {bindTags.length - 5}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Link>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEdit}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenOriginal}>
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Open original</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open original</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </>
  )
}

const PageListItem = memo(PageListItemComponent)
export default PageListItem
