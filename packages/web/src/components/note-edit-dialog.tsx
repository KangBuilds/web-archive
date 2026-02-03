import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@web-archive/shared/components/ui/dialog'
import { Button } from '@web-archive/shared/components/ui/button'
import { Textarea } from '@web-archive/shared/components/ui/textarea'
import { Label } from '@web-archive/shared/components/ui/label'
import { updatePage } from '~/data/page'
import type { Page } from '@web-archive/shared/types'

interface NoteEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: Page
}

export default function NoteEditDialog({
  open,
  onOpenChange,
  page,
}: NoteEditDialogProps) {
  const queryClient = useQueryClient()
  const [note, setNote] = useState(page.note ?? '')

  useEffect(() => {
    if (open) {
      setNote(page.note ?? '')
    }
  }, [open, page.note])

  const updateNoteMutation = useMutation({
    mutationFn: () =>
      updatePage({
        id: page.id,
        folderId: page.folderId,
        title: page.title,
        isShowcased: page.isShowcased,
        pageDesc: page.pageDesc,
        pageUrl: page.pageUrl,
        note: note || null,
      }),
    onSuccess: () => {
      toast.success('Note updated')
      queryClient.invalidateQueries({ queryKey: ['page-detail', String(page.id)] })
      onOpenChange(false)
    },
    onError: () => {
      toast.error('Failed to update note')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateNoteMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>
            Add your personal notes for this page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add your personal notes (optional)"
              rows={6}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateNoteMutation.isPending}>
              {updateNoteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
