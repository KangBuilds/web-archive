import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, Maximize2, Minimize2, Moon, Share2, StickyNote, Sun, Trash2 } from 'lucide-react'
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
import { useTheme } from '~/components/theme-provider'

const ShareDialog = lazy(() => import('~/components/share-dialog'))
const NoteEditDialog = lazy(() => import('~/components/note-edit-dialog'))

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
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const { theme, setTheme } = useTheme()

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

  const { data: pageContent, isLoading: pageLoading } = useQuery({
    queryKey: ['page-content', slug],
    queryFn: () => getPageContent(slug),
    enabled: !!slug,
  })

  // Create object URL from page content, recreating it when content changes
  // This properly handles React Query's cached data on re-navigation
  const pageContentUrl = useMemo(() => {
    if (!pageContent)
      return null
    const blob = new Blob([pageContent], { type: 'text/html' })
    return URL.createObjectURL(blob)
  }, [pageContent])

  // Cleanup object URL when component unmounts or URL changes
  useEffect(() => {
    return () => {
      if (pageContentUrl) {
        URL.revokeObjectURL(pageContentUrl)
      }
    }
  }, [pageContentUrl])

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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

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
    <>
      {shareDialogOpen && pageDetail && (
        <Suspense fallback={null}>
          <ShareDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            pageId={pageDetail.id}
            pageTitle={pageDetail.title}
          />
        </Suspense>
      )}
      {noteDialogOpen && pageDetail && (
        <Suspense fallback={null}>
          <NoteEditDialog
            open={noteDialogOpen}
            onOpenChange={setNoteDialogOpen}
            page={pageDetail}
          />
        </Suspense>
      )}
      <main className="flex h-svh flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
        <TooltipProvider>
        <div className="flex items-center gap-4">
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

          {pageDetail && (
            <h1 className="hidden max-w-md truncate text-sm font-medium sm:block">
              {pageDetail.title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Download button */}
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

          {/* Note button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setNoteDialogOpen(true)}>
                <StickyNote className="h-4 w-4" />
                <span className="sr-only">Edit note</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit note</TooltipContent>
          </Tooltip>

          {/* Share button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setShareDialogOpen(true)}>
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share page</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share page</TooltipContent>
          </Tooltip>

          {/* Theme toggle button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="sr-only">
                  {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            </TooltipContent>
          </Tooltip>

          {/* Fullscreen button */}
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

          {/* Delete button */}
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
        </div>
        </TooltipProvider>
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
    </>
  )
}
