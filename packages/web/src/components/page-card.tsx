import type { Page } from '@web-archive/shared/types'
import React, { memo, useContext, useState } from 'react'
import { Card, CardContent, CardFooter } from '@web-archive/shared/components/card'
import { Button } from '@web-archive/shared/components/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import { ExternalLink, SquarePen, Trash2 } from 'lucide-react'
import { TooltipPortal } from '@radix-ui/react-tooltip'
import { BadgeSpan } from '@web-archive/shared/components/badge'
import ScreenshotView from './screenshot-view'
import CardEditDialog from '~/components/card-edit-dialog'
import TagContext from '~/store/tag'
import { Link } from '~/router'

function Comp({ page, onPageDelete }: { page: Page, onPageDelete?: (page: Page) => void }) {
  const { tagCache, refreshTagCache } = useContext(TagContext)
  const bindTags = tagCache?.filter(tag => tag.pageIds.includes(page.id)) ?? []

  const handleClickPageUrl = (e: React.MouseEvent, page: Page) => {
    e.stopPropagation()
    e.preventDefault()
    window.open(page.pageUrl, '_blank')
  }

  const handleDeletePage = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (window.confirm('Are you sure you want to delete this page?')) {
      onPageDelete?.(page)
    }
  }

  const [openCardEditDialog, setOpenCardEditDialog] = useState(false)
  const handleEditPage = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    await refreshTagCache()
    setOpenCardEditDialog(true)
  }

  return (
    <div className="animate-fade-up">
      <CardEditDialog open={openCardEditDialog} onOpenChange={setOpenCardEditDialog} pageId={page.id} />

      <Card className="group overflow-hidden border-border/50 bg-card hover:border-border hover:shadow-soft-lg transition-all duration-300">
        <Link to="/page/:slug" params={{ slug: page.id.toString() }} className="block">
          {/* Screenshot */}
          <div className="relative overflow-hidden bg-muted">
            <ScreenshotView
              screenshotId={page.screenshotId}
              className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loadingClassName="w-full aspect-[16/10]"
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <CardContent className="p-4 space-y-3">
            {/* Title */}
            <h3 className="font-serif text-lg font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {page.title}
            </h3>

            {/* Tags */}
            {bindTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {bindTags.slice(0, 3).map(tag => (
                  <BadgeSpan
                    key={tag.id}
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-secondary/70 text-secondary-foreground border-0"
                  >
                    {tag.name}
                  </BadgeSpan>
                ))}
                {bindTags.length > 3 && (
                  <BadgeSpan variant="secondary" className="text-xs px-2 py-0.5 bg-secondary/70 text-secondary-foreground border-0">
                    +
                    {bindTags.length - 3}
                  </BadgeSpan>
                )}
              </div>
            )}

            {/* Description */}
            {page.pageDesc && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {page.pageDesc}
              </p>
            )}
          </CardContent>
        </Link>

        {/* Action buttons */}
        <CardFooter className="p-3 pt-0 flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={handleEditPage}
                >
                  <SquarePen className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Edit Page
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                  onClick={e => handleClickPageUrl(e, page)}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent side="bottom">
                  Open Original Link
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDeletePage}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Delete This Page
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </div>
  )
}

const PageCard = memo(Comp)

export default PageCard
