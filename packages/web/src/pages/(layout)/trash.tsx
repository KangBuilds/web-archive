import { Button } from '@web-archive/shared/components/button'
import { useRequest } from 'ahooks'
import { AlertTriangle, ArchiveRestore, Trash2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import { Card, CardContent, CardFooter } from '@web-archive/shared/components/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import type { Page } from '@web-archive/shared/types'
import EmptyWrapper from '~/components/empty-wrapper'
import ScreenshotView from '~/components/screenshot-view'
import { useMediaQuery } from '~/hooks/useMediaQuery'
import { clearDeletedPage, queryDeletedPage, restorePage } from '~/data/page'

function Trash() {
  const { data, run: fetchPage, loading } = useRequest(queryDeletedPage, {
    manual: true,
  })

  const { run: runRestorePage, loading: restoring } = useRequest(restorePage, {
    manual: true,
    onSuccess: () => {
      toast.success('Restore page success')
      fetchPage()
    },
  })

  const { run: runClearDeletedPage, loading: clearing } = useRequest(clearDeletedPage, {
    manual: true,
    onSuccess: () => {
      toast.success('Clear deleted page success')
      fetchPage()
    },
  })

  const handleClearAll = () => {
    if (window.confirm('Are you sure to clear all deleted pages?')) {
      runClearDeletedPage()
    }
  }

  useEffect(() => {
    fetchPage()
  }, [])

  const itemCount = data?.length ?? 0

  const { '2xl': is2xlScreen, xl: isXlScreen, md: isMdScreen } = useMediaQuery()

  const columnCount = useMemo(() => {
    if (is2xlScreen)
      return 4
    if (isXlScreen)
      return 3
    if (isMdScreen)
      return 2
    return 1
  }, [is2xlScreen, isXlScreen, isMdScreen])

  const reorganizedPages = useMemo(() => {
    const result = Array.from({ length: columnCount }, () => [] as Page[])
    data?.forEach((page, index) => {
      result[index % columnCount].push(page)
    })
    return result
  }, [data, columnCount])

  return (
    <div className="flex flex-col h-[calc(100vh-1px)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/10">
              <Trash2 className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-semibold text-foreground">Trash</h1>
              <p className="text-xs text-muted-foreground">
                {loading ? 'Loading...' : `${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {itemCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              disabled={clearing}
              className="h-9"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {clearing ? 'Clearing...' : 'Clear All'}
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-6">
          <EmptyWrapper
            empty={itemCount === 0}
            emptyElement={(
              <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Trash2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-lg font-medium text-foreground mb-1">Trash is empty</h3>
                <p className="text-sm text-muted-foreground">Deleted pages will appear here</p>
              </div>
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {reorganizedPages.map((columnPages, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  {columnPages.map((page, pageIdx) => (
                    <div
                      key={page.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${(idx * 50) + (pageIdx * 75)}ms` }}
                    >
                      <Card className="group overflow-hidden border-border/50 bg-card hover:border-border hover:shadow-soft-lg transition-all duration-300">
                        {/* Screenshot */}
                        <div className="relative overflow-hidden bg-muted">
                          <ScreenshotView
                            screenshotId={page.screenshotId}
                            className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            loadingClassName="w-full aspect-[16/10]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-serif text-lg font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                            {page.title}
                          </h3>
                          {page.pageDesc && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {page.pageDesc}
                            </p>
                          )}
                        </CardContent>

                        <CardFooter className="p-3 pt-0 flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-3 text-primary hover:text-primary hover:bg-primary/10"
                                  disabled={restoring}
                                  onClick={() => runRestorePage(page.id)}
                                >
                                  <ArchiveRestore className="h-4 w-4 mr-1.5" />
                                  <span className="text-xs font-medium">Restore</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">Restore This Page</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </EmptyWrapper>
        </div>
      </ScrollArea>
    </div>
  )
}

export default Trash
