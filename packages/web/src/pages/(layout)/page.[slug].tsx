import { Button } from '@web-archive/shared/components/button'
import { useRequest } from 'ahooks'
import { ArrowLeft, Download, Maximize2, Minimize2, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import { useSidebar } from '@web-archive/shared/components/side-bar'
import IframePageContent from '~/components/iframe-page-content'
import LoadingWrapper from '~/components/loading-wrapper'
import { deletePage, getPageDetail } from '~/data/page'
import { useObjectURL } from '~/hooks/useObjectUrl'
import { useNavigate, useParams } from '~/router'

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
  const { loading: pageLoading } = useRequest(
    () => getPageContent(slug),
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
    if (!window.confirm('Are you sure you want to delete this page?'))
      return
    if (!pageDetail)
      return
    await runDeletePage(pageDetail)
    goBack()
  }

  const [isFullscreen, setIsFullscreen] = useState(false)
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar()
  const sidebarWasOpen = useRef(sidebarOpen)

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      sidebarWasOpen.current = sidebarOpen
      setSidebarOpen(false)
      document.documentElement.requestFullscreen()
    }
    else {
      document.exitFullscreen()
    }
  }, [sidebarOpen, setSidebarOpen])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement
      setIsFullscreen(isNowFullscreen)
      if (!isNowFullscreen) {
        setSidebarOpen(sidebarWasOpen.current)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [setSidebarOpen])

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
                    <span className="hidden sm:inline text-sm">Download</span>
                  </Button>
                </a>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Fullscreen button */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
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
              <TooltipContent>Delete This Page</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <LoadingWrapper loading={pageLoading}>
          <IframePageContent pageContentUrl={pageContentUrl || ''} />
        </LoadingWrapper>
      </div>
    </main>
  )
}

export default ArchivePage
