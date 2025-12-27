import { Suspense, lazy, memo, useContext, useState } from 'react'
import { ExternalLink, Pencil, Share2, Trash2 } from 'lucide-react'
import type { Page } from '@web-archive/shared/types'
import {
  Card,
  CardContent,
  CardFooter,
} from '@web-archive/shared/components/ui/card'
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

interface PageCardProps {
  page: Page
  onDelete?: (page: Page) => void
}

function PageCardComponent({ page, onDelete }: PageCardProps) {
  const { tagCache, refreshTagCache } = useContext(TagContext)
  const bindTags = tagCache?.filter(tag => tag.pageIds.includes(page.id)) ?? []

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

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

  const handleEdit = async () => {
    await refreshTagCache()
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

      <Card className="group flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
        <Link
          to="/page/:slug"
          params={{ slug: page.id.toString() }}
          className="block flex-1"
        >
          {/* Screenshot */}
          <div className="relative aspect-video overflow-hidden bg-muted">
            <ScreenshotView
              screenshotId={page.screenshotId}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loadingClassName="h-full w-full"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <CardContent className="p-4">
            {/* Title */}
            <h3 className="line-clamp-2 font-semibold leading-tight transition-colors group-hover:text-primary">
              {page.title}
            </h3>

            {/* Tags */}
            {bindTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {bindTags.slice(0, 3).map(tag => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    {tag.name}
                  </Badge>
                ))}
                {bindTags.length > 3 && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    +
                    {bindTags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Description */}
            {page.pageDesc && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {page.pageDesc}
              </p>
            )}
          </CardContent>
        </Link>

        {/* Actions */}
        <CardFooter className="flex justify-end gap-1 p-2 pt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleEdit}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleOpenOriginal}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Open original</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open original</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
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
        </CardFooter>
      </Card>
    </>
  )
}

const PageCard = memo(PageCardComponent)
export default PageCard
