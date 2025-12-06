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

interface EditFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderName: string
  onFolderNameChange: (name: string) => void
  onSubmit: () => void
  loading?: boolean
}

export default function EditFolderDialog({
  open,
  onOpenChange,
  folderName,
  onFolderNameChange,
  onSubmit,
  loading,
}: EditFolderDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (folderName.trim()) {
      onSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename folder</DialogTitle>
          <DialogDescription>
            Enter a new name for this folder.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-folder-name">Folder name</Label>
              <Input
                id="edit-folder-name"
                value={folderName}
                onChange={e => onFolderNameChange(e.target.value)}
                placeholder="My folder"
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
            <Button type="submit" disabled={!folderName.trim() || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
