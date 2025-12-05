import { Button } from '@web-archive/shared/components/button'
import { useKeyPress, useRequest } from 'ahooks'
import { ArrowLeft, ArrowRight, Home, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import PoweredBy from '~/components/powerd-by'
import { getNextShowcasePageId } from '~/data/showcase'
import { useNavigate, useParams } from '~/router'

async function getPageContent(pageId: string | undefined) {
  if (!pageId)
    return ''
  const url = `/api/showcase/content?pageId=${pageId}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
    },
  })
  return await res.text()
}

function ShowcasePage() {
  const navigate = useNavigate()
  const { slug } = useParams('/showcase/page/:slug')

  useEffect(() => {
    if (!slug) {
      navigate('/showcase/folder')
    }
  })

  const { run: goNext, loading: getNextLoading } = useRequest(
    getNextShowcasePageId,
    {
      manual: true,
      onSuccess(nextId) {
        navigate('/showcase/page/:slug', {
          params: {
            slug: String(nextId),
          },
        })
      },
    },
  )

  const goBack = () => {
    window.history.back()
  }

  const goHome = () => {
    navigate('/showcase/folder')
  }

  useKeyPress('leftarrow', () => {
    goBack()
  })

  useKeyPress('rightarrow', () => {
    goNext(Number(slug))
  })

  const { slug: pageId } = useParams('/showcase/page/:slug')
  const { data: pageContentUrl, loading: pageLoading } = useRequest(async () => {
    const pageHtml = await getPageContent(slug)
    const objectUrl = URL.createObjectURL(new Blob([pageHtml], { type: 'text/html' }))
    return objectUrl
  }, {
    refreshDeps: [pageId],
  })

  useEffect(() => {
    return () => {
      pageContentUrl && URL.revokeObjectURL(pageContentUrl)
    }
  }, [pageContentUrl])

  const isLoading = pageLoading || getNextLoading

  return (
    <main className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-4 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={goHome}
                >
                  <Home className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to showcase</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="h-6 w-px bg-border" />

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={goBack}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous (←)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => goNext(Number(slug))}
                  disabled={getNextLoading}
                >
                  {getNextLoading
                    ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                      )
                    : (
                      <ArrowRight className="w-5 h-5" />
                      )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next (→)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <a
          href="https://github.com/ray-d-song/web-archive"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Web Archive
        </a>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading
          ? (
            <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading page...</p>
            </div>
            )
          : (
            <iframe
              src={pageContentUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
            )}
      </div>
    </main>
  )
}

export default ShowcasePage
