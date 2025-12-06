import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, Maximize2, Minimize2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@web-archive/shared/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@web-archive/shared/components/ui/tooltip'
import { Skeleton } from '@web-archive/shared/components/ui/skeleton'
import { useSidebar } from '@web-archive/shared/components/ui/sidebar'
import { useNavigate, useParams } from '~/router'
import { deletePage, getPageDetail } from '~/data/page'
import { useObjectURL } from '~/hooks/useObjectUrl'

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

function IframePageContent({ pageContentUrl }: { pageContentUrl: string }) {
  return (
    <iframe
      src={pageContentUrl}
      className="h-full w-full border-0"
      title="Archived page content"
      sandbox="allow-same-origin allow-scripts"
    />
  )
}

export default function ArchivePage() {
  const navigate = useNavigate()
  const { slug } = useParams('/page/:slug')
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar()
  const sidebarWasOpen = useRef(sidebarOpen)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!slug) {
      navigate('/')
    }
  }, [slug, navigate])

  // Queries
  const { data: pageDetail } = useQuery({
    queryKey: ['page-detail', slug],
    queryFn: () => getPageDetail(slug!),
    enabled: !!slug,
  })

  const { objectURL: pageContentUrl, setObject } = useObjectURL(null)

  const { isLoading: pageLoading } = useQuery({
    queryKey: ['page-content', slug],
    queryFn: async () => {
      const html = await getPageContent(slug)
      setObject(html)
      return html
    },
    enabled: !!slug,
  })

  // Mutations
  const deletePageMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      toast.success('Page deleted')
      goBack()
    },
  })

  const goBack = () => {
    if (pageDetail) {
      navigate('/folder/:slug', { params: { slug: String(pageDetail.folderId) } })
    }
    else {
      window.history.back()
    }
  }

  const handleDeletePage = async () => {
    if (!window.confirm('Are you sure you want to delete this page?'))
      return
    if (!pageDetail)
      return
    deletePageMutation.mutate(pageDetail)
  }

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
    <main className="flex h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goBack}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Go back</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Go back</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {pageDetail && (
            <h1 className="hidden max-w-md truncate text-sm font-medium sm:block">
              {pageDetail.title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Download button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={pageContentUrl ?? ''}
                    download={`${pageDetail?.title ?? 'archive'}.html`}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download HTML</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Fullscreen button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                  {isFullscreen
                    ? (
                      <Minimize2 className="h-4 w-4" />
                      )
                    : (
                      <Maximize2 className="h-4 w-4" />
                      )}
                  <span className="sr-only">
                    {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Delete button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeletePage}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete page</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete page</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {pageLoading
          ? (
            <div className="flex h-full items-center justify-center">
              <div className="space-y-4 text-center">
                <Skeleton className="mx-auto h-8 w-8 rounded-full" />
                <p className="text-sm text-muted-foreground">Loading page...</p>
              </div>
            </div>
            )
          : (
            <IframePageContent pageContentUrl={pageContentUrl || ''} />
            )}
      </div>
    </main>
  )
}
