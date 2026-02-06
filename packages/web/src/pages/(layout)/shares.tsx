import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, Copy, ExternalLink, Link2, RefreshCw, Trash2 } from 'lucide-react'
import type { ShareLinkWithPage } from '@web-archive/shared/types'
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
import { getAllShareLinks, deleteShareLink, getShareUrl } from '~/data/share'
import { Link } from '~/router'

function isExpired(expiresAt: Date | null): boolean {
  if (!expiresAt)
    return false
  return new Date(expiresAt) < new Date()
}

function formatExpiration(expiresAt: Date | null): string {
  if (!expiresAt)
    return 'Never expires'
  const date = new Date(expiresAt)
  const now = new Date()
  if (date < now)
    return `Expired on ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
  return `Expires ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

function ShareLinkCard({
  shareLink,
  onDelete,
  onCopy,
  copiedId,
}: {
  shareLink: ShareLinkWithPage
  onDelete: (id: number) => void
  onCopy: (shareLink: ShareLinkWithPage) => void
  copiedId: number | null
}) {
  const expired = isExpired(shareLink.expiresAt)

  return (
    <Card className={`transition-all hover:shadow-lg ${expired ? 'opacity-50' : ''}`}>
      <CardContent className="p-5">
        <div className="space-y-2">
          {/* Page title as link */}
          <div className="flex items-center gap-2">
            <Link2 className={`h-4 w-4 shrink-0 ${expired ? 'text-muted-foreground' : 'text-primary'}`} />
            <Link
              to="/page/:slug"
              params={{ slug: shareLink.pageId.toString() }}
              className="text-base font-semibold leading-tight hover:text-primary hover:underline truncate"
            >
              {shareLink.pageTitle || `Page #${shareLink.pageId}`}
            </Link>
            {expired && (
              <span className="ml-2 inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                Expired
              </span>
            )}
          </div>

          {/* Share URL */}
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-sm font-mono text-muted-foreground">
              {getShareUrl(shareLink.shareCode)}
            </code>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => onCopy(shareLink)}
                    disabled={expired}
                  >
                    {copiedId === shareLink.id
                      ? <Check className="h-4 w-4 text-green-500" />
                      : <Copy className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{expired ? 'Link expired' : 'Copy link'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => !expired && window.open(getShareUrl(shareLink.shareCode), '_blank')}
                    disabled={expired}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{expired ? 'Link expired' : 'Open link'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(shareLink.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete link</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              Created
              {' '}
              {new Date(shareLink.createdAt).toLocaleDateString()}
              {' '}
              {new Date(shareLink.createdAt).toLocaleTimeString()}
            </span>
            <span className={`ml-auto ${expired ? 'text-destructive' : ''}`}>
              {formatExpiration(shareLink.expiresAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ShareListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-8 w-full" />
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
        <Link2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No shared links</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Share a page to create your first share link
      </p>
    </div>
  )
}

export default function SharesPage() {
  const [filter, setFilter] = useState('')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data: shareLinks = [], isLoading, isFetching } = useQuery({
    queryKey: ['all-share-links'],
    queryFn: getAllShareLinks,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShareLink,
    onSuccess: () => {
      toast.success('Share link deleted')
      queryClient.invalidateQueries({ queryKey: ['all-share-links'] })
    },
    onError: () => {
      toast.error('Failed to delete share link')
    },
  })

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['all-share-links'] })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this share link?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCopy = async (shareLink: ShareLinkWithPage) => {
    const url = getShareUrl(shareLink.shareCode)
    await navigator.clipboard.writeText(url)
    setCopiedId(shareLink.id)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredLinks = useMemo(() => {
    if (!filter)
      return shareLinks
    const lower = filter.toLowerCase()
    return shareLinks.filter(
      link =>
        (link.pageTitle ?? '').toLowerCase().includes(lower)
        || link.shareCode.toLowerCase().includes(lower),
    )
  }, [shareLinks, filter])

  const activeLinks = filteredLinks.filter(link => !isExpired(link.expiresAt))
  const expiredLinks = filteredLinks.filter(link => isExpired(link.expiresAt))

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
            <TooltipContent>Refresh share links</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex-1 max-w-md">
          <input
            type="text"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Filter share links..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {shareLinks.length}
          {' '}
          link(s)
        </span>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl p-6">
          {isLoading
            ? <ShareListSkeleton />
            : filteredLinks.length === 0
              ? <EmptyState />
              : (
                  <div className="space-y-6">
                    {/* Active links */}
                    {activeLinks.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-medium text-muted-foreground">
                          Active (
                          {activeLinks.length}
                          )
                        </h2>
                        {activeLinks.map(link => (
                          <ShareLinkCard
                            key={link.id}
                            shareLink={link}
                            onDelete={handleDelete}
                            onCopy={handleCopy}
                            copiedId={copiedId}
                          />
                        ))}
                      </div>
                    )}

                    {/* Expired links */}
                    {expiredLinks.length > 0 && (
                      <div className="space-y-4">
                        <h2 className="text-sm font-medium text-muted-foreground">
                          Expired (
                          {expiredLinks.length}
                          )
                        </h2>
                        {expiredLinks.map(link => (
                          <ShareLinkCard
                            key={link.id}
                            shareLink={link}
                            onDelete={handleDelete}
                            onCopy={handleCopy}
                            copiedId={copiedId}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
        </div>
      </ScrollArea>
    </div>
  )
}
