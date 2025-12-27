import { memo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, Copy, Link2, Loader2, Trash2 } from 'lucide-react'
import type { ShareLink } from '@web-archive/shared/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@web-archive/shared/components/ui/dialog'
import { Button } from '@web-archive/shared/components/ui/button'
import { Label } from '@web-archive/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web-archive/shared/components/ui/select'
import { Input } from '@web-archive/shared/components/ui/input'
import { Skeleton } from '@web-archive/shared/components/ui/skeleton'
import {
  createShareLink,
  deleteShareLink,
  getShareLinksForPage,
  getShareUrl,
} from '~/data/share'

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pageId: number
  pageTitle: string
}

const EXPIRATION_OPTIONS = [
  { value: 'never', label: 'Never expire', hours: null },
  { value: '1h', label: '1 hour', hours: 1 },
  { value: '24h', label: '24 hours', hours: 24 },
  { value: '7d', label: '7 days', hours: 24 * 7 },
  { value: '30d', label: '30 days', hours: 24 * 30 },
  { value: '90d', label: '90 days', hours: 24 * 90 },
]

function ShareDialogComponent({
  open,
  onOpenChange,
  pageId,
  pageTitle,
}: ShareDialogProps) {
  const queryClient = useQueryClient()
  const [expiration, setExpiration] = useState('never')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [newlyCreatedLink, setNewlyCreatedLink] = useState<ShareLink | null>(null)

  const { data: shareLinks = [], isLoading } = useQuery({
    queryKey: ['share-links', pageId],
    queryFn: () => getShareLinksForPage(pageId),
    enabled: open,
  })

  const createMutation = useMutation({
    mutationFn: ({ pageId, expiresIn }: { pageId: number, expiresIn: number | null }) =>
      createShareLink(pageId, expiresIn),
    onSuccess: (newLink) => {
      toast.success('Share link created')
      setNewlyCreatedLink(newLink)
      queryClient.invalidateQueries({ queryKey: ['share-links', pageId] })
    },
    onError: () => {
      toast.error('Failed to create share link')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShareLink,
    onSuccess: () => {
      toast.success('Share link deleted')
      queryClient.invalidateQueries({ queryKey: ['share-links', pageId] })
    },
    onError: () => {
      toast.error('Failed to delete share link')
    },
  })

  const handleCreate = () => {
    const option = EXPIRATION_OPTIONS.find(o => o.value === expiration)
    createMutation.mutate({
      pageId,
      expiresIn: option?.hours ?? null,
    })
  }

  const handleCopy = async (shareLink: ShareLink) => {
    const url = getShareUrl(shareLink.shareCode)
    await navigator.clipboard.writeText(url)
    setCopiedId(shareLink.id)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this share link?')) {
      deleteMutation.mutate(id)
      if (newlyCreatedLink?.id === id) {
        setNewlyCreatedLink(null)
      }
    }
  }

  const formatExpiration = (expiresAt: Date | null) => {
    if (!expiresAt)
      return 'Never expires'
    const date = new Date(expiresAt)
    const now = new Date()
    if (date < now)
      return 'Expired'
    return `Expires ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
  }

  const isExpired = (expiresAt: Date | null) => {
    if (!expiresAt)
      return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share Page
          </DialogTitle>
          <DialogDescription className="line-clamp-1">
            Create a shareable link for "
            {pageTitle}
            "
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new link */}
          <div className="space-y-3 rounded-lg border p-4">
            <div className="space-y-2">
              <Label>Expiration</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="w-full"
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Link2 className="mr-2 h-4 w-4" />
              Create Share Link
            </Button>
          </div>

          {/* Show newly created link prominently */}
          {newlyCreatedLink && (
            <div className="space-y-2 rounded-lg border-2 border-primary/50 bg-primary/5 p-4">
              <Label className="text-primary">New Link Created</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={getShareUrl(newlyCreatedLink.shareCode)}
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(newlyCreatedLink)}
                >
                  {copiedId === newlyCreatedLink.id
                    ? (
                      <Check className="h-4 w-4 text-green-500" />
                      )
                    : (
                      <Copy className="h-4 w-4" />
                      )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatExpiration(newlyCreatedLink.expiresAt)}
              </p>
            </div>
          )}

          {/* Existing links */}
          <div className="space-y-2">
            <Label>Existing Share Links</Label>
            {isLoading
              ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
                )
              : shareLinks.length === 0
                ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No share links yet
                  </p>
                  )
                : (
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {shareLinks
                      .filter(link => link.id !== newlyCreatedLink?.id)
                      .map(link => (
                        <div
                          key={link.id}
                          className={`flex items-center justify-between gap-2 rounded-md border p-2 ${
                        isExpired(link.expiresAt) ? 'opacity-50' : ''
                      }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-mono">
                              {link.shareCode}
                            </p>
                            <p
                              className={`text-xs ${
                            isExpired(link.expiresAt)
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          }`}
                            >
                              {formatExpiration(link.expiresAt)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCopy(link)}
                              disabled={isExpired(link.expiresAt)}
                            >
                              {copiedId === link.id
                                ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                  )
                                : (
                                  <Copy className="h-4 w-4" />
                                  )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDelete(link.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                  )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ShareDialog = memo(ShareDialogComponent)
export default ShareDialog

