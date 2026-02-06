import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Loader2, RefreshCw, StickyNote, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Page } from '@web-archive/shared/types'
import { ScrollArea } from '@web-archive/shared/components/ui/scroll-area'
import { Skeleton } from '@web-archive/shared/components/ui/skeleton'
import {
  Card,
  CardContent,
} from '@web-archive/shared/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@web-archive/shared/components/ui/tooltip'
import { Button } from '@web-archive/shared/components/ui/button'
import { SidebarTrigger } from '@web-archive/shared/components/ui/sidebar'
import { getPagesWithNotes, updatePage } from '~/data/page'
import { Link } from '~/router'

function NoteCard({ page, onDelete, isDeleting }: { page: Page, onDelete: (page: Page) => void, isDeleting: boolean }) {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="p-5">
        <div className="space-y-2">
          {/* Page title as link */}
          <div className="flex items-center gap-2">
            <Link
              to="/page/:slug"
              params={{ slug: page.id.toString() }}
              className="text-base font-semibold leading-tight hover:text-primary hover:underline truncate flex-1"
            >
              {page.title}
            </Link>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(page)}
                    disabled={isDeleting}
                  >
                    {isDeleting
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4" />}
                    <span className="sr-only">Delete note</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete note</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Note content */}
          <div className="rounded-md bg-muted/50 p-3">
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {page.note}
            </p>
          </div>

          {/* Meta: original URL and date */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {page.pageUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={page.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-foreground truncate max-w-xs"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{page.pageUrl}</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{page.pageUrl}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <span className="ml-auto">
              {new Date(page.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NoteListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <StickyNote className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No notes yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Add notes to your archived pages to see them here
      </p>
    </div>
  )
}

export default function NotesPage() {
  const [filter, setFilter] = useState('')
  const [deletingPageId, setDeletingPageId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data: pages = [], isLoading, isFetching } = useQuery({
    queryKey: ['pages-with-notes'],
    queryFn: getPagesWithNotes,
  })

  const deleteNoteMutation = useMutation({
    mutationFn: (page: Page) =>
      updatePage({
        id: page.id,
        folderId: page.folderId,
        title: page.title,
        isShowcased: page.isShowcased,
        pageDesc: page.pageDesc,
        pageUrl: page.pageUrl,
        note: null,
      }),
    onMutate: (page) => {
      setDeletingPageId(page.id)
    },
    onSuccess: () => {
      toast.success('Note deleted')
      queryClient.invalidateQueries({ queryKey: ['pages-with-notes'] })
    },
    onError: () => {
      toast.error('Failed to delete note')
    },
    onSettled: () => {
      setDeletingPageId(null)
    },
  })

  const handleDeleteNote = (page: Page) => {
    deleteNoteMutation.mutate(page)
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['pages-with-notes'] })
  }

  const filteredPages = useMemo(() => {
    if (!filter)
      return pages
    const lower = filter.toLowerCase()
    return pages.filter(
      page =>
        page.title.toLowerCase().includes(lower)
        || (page.note ?? '').toLowerCase().includes(lower),
    )
  }, [pages, filter])

  return (
    <div className="flex h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
        <SidebarTrigger />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh notes</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex-1 max-w-md">
          <input
            type="text"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Filter notes..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl p-6">
          {isLoading
            ? <NoteListSkeleton />
            : filteredPages.length === 0
              ? <EmptyState />
              : (
                  <div className="space-y-4">
                    {filteredPages.map(page => (
                      <NoteCard key={page.id} page={page} onDelete={handleDeleteNote} isDeleting={deletingPageId === page.id} />
                    ))}
                  </div>
                )}
        </div>
      </ScrollArea>
    </div>
  )
}
