import { Button } from '@web-archive/shared/components/button'
import { useRequest } from 'ahooks'
import { AlertTriangle, ArchiveRestore, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import EmptyWrapper from '~/components/empty-wrapper'
import ListView from '~/components/list-view'
import { clearDeletedPage, queryDeletedPage, restorePage } from '~/data/page'

function Trash() {
  const { t } = useTranslation()
  const { data, run: fetchPage, loading } = useRequest(queryDeletedPage, {
    manual: true,
  })

  const { run: runRestorePage, loading: restoring } = useRequest(restorePage, {
    manual: true,
    onSuccess: () => {
      toast.success(t('restore-page-success'))
      fetchPage()
    },
  })

  const { run: runClearDeletedPage, loading: clearing } = useRequest(clearDeletedPage, {
    manual: true,
    onSuccess: () => {
      toast.success(t('clear-success'))
      fetchPage()
    },
  })

  const handleClearAll = () => {
    if (window.confirm(t('clear-confirm'))) {
      runClearDeletedPage()
    }
  }

  useEffect(() => {
    fetchPage()
  }, [])

  const itemCount = data?.length ?? 0

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
              <h1 className="font-serif text-lg font-semibold text-foreground">{t('trash')}</h1>
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
              {clearing ? 'Clearing...' : t('clear-all')}
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
            <div className="animate-fade-up">
              <ListView pages={data}>
                {page => (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-primary hover:text-primary hover:bg-primary/10"
                    disabled={restoring}
                    onClick={(e) => {
                      e.stopPropagation()
                      runRestorePage(page.id)
                    }}
                  >
                    <ArchiveRestore className="h-4 w-4 mr-1.5" />
                    <span className="text-xs font-medium">Restore</span>
                  </Button>
                )}
              </ListView>
            </div>
          </EmptyWrapper>
        </div>
      </ScrollArea>
    </div>
  )
}

export default Trash
