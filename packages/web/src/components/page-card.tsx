import type { Page } from '@web-archive/shared/types'
import React, { memo, useContext, useState } from 'react'
import { useRequest } from 'ahooks'
import { Card, CardContent, CardFooter } from '@web-archive/shared/components/card'
import { Button } from '@web-archive/shared/components/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import { ExternalLink, Eye, EyeOff, SquarePen, Trash2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BadgeSpan } from '@web-archive/shared/components/badge'
import { TooltipPortal } from '@radix-ui/react-tooltip'
import { useTranslation } from 'react-i18next'
import ScreenshotView from './screenshot-view'
import { updatePageShowcase } from '~/data/page'
import CardEditDialog from '~/components/card-edit-dialog'
import TagContext from '~/store/tag'
import { Link } from '~/router'

function Comp({ page, onPageDelete }: { page: Page, onPageDelete?: (page: Page) => void }) {
  const { t } = useTranslation()
  const { tagCache, refreshTagCache } = useContext(TagContext)
  const bindTags = tagCache?.filter(tag => tag.pageIds.includes(page.id)) ?? []

  const location = useLocation()
  const isShowcased = location.pathname.startsWith('/showcase')
  const redirectTo = isShowcased ? `/showcase/page/:slug` : `/page/:slug`

  const handleClickPageUrl = (e: React.MouseEvent, page: Page) => {
    e.stopPropagation()
    e.preventDefault()
    window.open(page.pageUrl, '_blank')
  }

  const handleDeletePage = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (window.confirm(t('delete-this-page-confirm'))) {
      onPageDelete?.(page)
    }
  }

  const [showcaseState, setShowcaseState] = useState(page.isShowcased)
  const { run: updateShowcase } = useRequest(
    updatePageShowcase,
    {
      manual: true,
      onSuccess() {
        toast.success(t('success'))
        setShowcaseState(showcaseState === 1 ? 0 : 1)
      },
    },
  )

  const [openCardEditDialog, setOpenCardEditDialog] = useState(false)
  const handleEditPage = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    await refreshTagCache()
    setOpenCardEditDialog(true)
  }

  return (
    <div className="animate-fade-up">
      {!isShowcased && (
        <CardEditDialog open={openCardEditDialog} onOpenChange={setOpenCardEditDialog} pageId={page.id} />
      )}

      <Card className="group overflow-hidden border-border/50 bg-card hover:border-border hover:shadow-soft-lg transition-all duration-300">
        <Link to={redirectTo} params={{ slug: page.id.toString() }} className="block">
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
          {!isShowcased && (
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
                  {t('edit-page')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

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
                  {t('open-original-link')}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>

          {!isShowcased && (
            <>
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
                    {t('delete-page')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${
                        showcaseState === 1
                          ? 'text-primary hover:text-primary/80'
                          : 'text-muted-foreground hover:text-foreground'
                      } hover:bg-accent`}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        updateShowcase({ id: page.id, isShowcased: showcaseState === 1 ? 0 : 1 })
                      }}
                    >
                      {showcaseState === 1 ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent side="bottom">
                      {showcaseState === 1 ? t('remove-from-showcase') : t('add-to-showcase')}
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

const PageCard = memo(Comp)

export default PageCard
