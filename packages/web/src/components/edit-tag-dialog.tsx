import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@web-archive/shared/components/ui/dialog'
import { Button } from '@web-archive/shared/components/ui/button'
import { Input } from '@web-archive/shared/components/ui/input'
import { Label } from '@web-archive/shared/components/ui/label'

interface EditTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tagName: string
  onTagNameChange: (name: string) => void
  onSubmit: () => void
  loading?: boolean
}

export default function EditTagDialog({
  open,
  onOpenChange,
  tagName,
  onTagNameChange,
  onSubmit,
  loading,
}: EditTagDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tagName.trim()) {
      onSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename tag</DialogTitle>
          <DialogDescription>Enter a new name for this tag.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-tag-name">Tag name</Label>
              <Input
                id="edit-tag-name"
                value={tagName}
                onChange={e => onTagNameChange(e.target.value)}
                placeholder="My tag"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!tagName.trim() || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
