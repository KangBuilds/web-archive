import { Suspense, lazy, memo, useContext, useState } from 'react'
import { ExternalLink, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import type { Page } from '@web-archive/shared/types'
import {
  Card,
  CardContent,
  CardFooter,
} from '@web-archive/shared/components/ui/card'
import { Badge } from '@web-archive/shared/components/ui/badge'
import { Button } from '@web-archive/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@web-archive/shared/components/ui/dropdown-menu'
import TagContext from '~/store/tag'
import { Link } from '~/router'
import ScreenshotView from '~/components/screenshot-view'

const CardEditDialog = lazy(() => import('~/components/card-edit-dialog'))

interface PageCardProps {
  page: Page
  onDelete?: (page: Page) => void
}

function PageCardComponent({ page, onDelete }: PageCardProps) {
  const { tagCache, refreshTagCache } = useContext(TagContext)
  const bindTags = tagCache?.filter(tag => tag.pageIds.includes(page.id)) ?? []

  const [editDialogOpen, setEditDialogOpen] = useState(false)

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

      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <Link
          to="/page/:slug"
          params={{ slug: page.id.toString() }}
          className="block"
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleOpenOriginal}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">Open original</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenOriginal}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open original
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
    </>
  )
}

const PageCard = memo(PageCardComponent)
export default PageCard
