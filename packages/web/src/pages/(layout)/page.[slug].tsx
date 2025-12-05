import { Button } from '@web-archive/shared/components/button'
import { useRequest } from 'ahooks'
import { ArrowLeft, BookOpen, Download, Monitor, Trash2 } from 'lucide-react'
import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import IframePageContent from '~/components/iframe-page-content'
import LoadingWrapper from '~/components/loading-wrapper'
import ReadabilityPageContent from '~/components/readability-page-content'
import { deletePage, getPageDetail } from '~/data/page'
import { useObjectURL } from '~/hooks/useObjectUrl'
import { useNavigate, useParams } from '~/router'
import AppContext from '~/store/app'

async function getPageContent(pageId: string | undefined) {
  if (!pageId)
    return ''
  const url = `/api/pages/content?pageId=${pageId}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
  return await res.text()
}

function ArchivePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { slug } = useParams('/page/:slug')

  useEffect(() => {
    if (!slug) {
      navigate('/')
    }
  })

  const { data: pageDetail } = useRequest(
    getPageDetail,
    {
      onSuccess: (pageDetail) => {
        if (!pageDetail) {
          navigate('/error/:slug', { params: { slug: '404' } })
        }
      },
      defaultParams: [slug],
    },
  )

  const goBack = () => {
    if (pageDetail)
      navigate('/folder/:slug', { params: { slug: String(pageDetail?.folderId) } })
    else
      window.history.back()
  }

  const { objectURL: pageContentUrl, setObject } = useObjectURL(null)
  const { data: pageHtml, loading: pageLoading } = useRequest(
    async () => {
      const pageHtml = await getPageContent(slug)
      return pageHtml
    },
    {
      onSuccess: (pageHtml) => {
        setObject(pageHtml)
      },
    },
  )

  const { runAsync: runDeletePage } = useRequest(
    deletePage,
    {
      manual: true,
    },
  )

  const handleDeletePage = async () => {
    if (!window.confirm(t('delete-this-page-confirm')))
      return
    if (!pageDetail)
      return
    await runDeletePage(pageDetail)
    goBack()
  }

  const { readMode, setReadMode } = useContext(AppContext)

  return (
    <main className="h-screen w-screen lg:w-full flex flex-col bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 flex items-center justify-between h-14 px-4 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={goBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {pageDetail && (
            <div className="hidden sm:block">
              <h1 className="font-serif text-sm font-medium text-foreground line-clamp-1 max-w-md">
                {pageDetail.title}
              </h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-secondary/50 rounded-lg p-0.5">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 rounded-md transition-all ${
                      readMode
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setReadMode(true)}
                  >
                    <BookOpen className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-medium">Read</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('open-read-mode')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 rounded-md transition-all ${
                      !readMode
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setReadMode(false)}
                  >
                    <Monitor className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-medium">Original</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('open-iframe-mode')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Download button */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={pageContentUrl ?? ''}
                  download={`${pageDetail?.title ?? 'Download'}.html`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline text-sm">{t('download')}</span>
                  </Button>
                </a>
              </TooltipTrigger>
              <TooltipContent>{t('download')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Delete button */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDeletePage}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('delete-page')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <LoadingWrapper loading={pageLoading}>
          {readMode
            ? (
              <div className="h-full overflow-auto">
                <div className="max-w-3xl mx-auto px-6 py-8">
                  <ReadabilityPageContent pageHtml={pageHtml || ''} />
                </div>
              </div>
              )
            : (
              <IframePageContent pageContentUrl={pageContentUrl || ''} />
              )}
        </LoadingWrapper>
      </div>
    </main>
  )
}

export default ArchivePage
