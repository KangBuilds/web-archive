import { useState } from 'react'
import { Check, Hash, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { Tag } from '@web-archive/shared/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@web-archive/shared/components/ui/dialog'
import { Button } from '@web-archive/shared/components/ui/button'
import { Input } from '@web-archive/shared/components/ui/input'
import { ScrollArea } from '@web-archive/shared/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@web-archive/shared/components/ui/popover'

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#78716c', // stone
  '#6b7280', // gray
  '#ffffff', // white
]

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(color)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="size-7 shrink-0 aspect-square rounded border border-border shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          style={{ backgroundColor: color }}
          title="Change color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="grid grid-cols-6 gap-1.5">
          {PRESET_COLORS.map(preset => (
            <button
              key={preset}
              type="button"
              className="group relative size-7 rounded border border-border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ backgroundColor: preset }}
              onClick={() => {
                onChange(preset)
                setCustomColor(preset)
              }}
            >
              {color === preset && (
                <Check
                  className="absolute inset-0 m-auto size-3.5"
                  style={{ color: preset === '#ffffff' ? '#000' : '#fff' }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 border-t pt-3">
          <div
            className="size-7 shrink-0 rounded border border-border"
            style={{ backgroundColor: customColor }}
          />
          <Input
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value)
              if (/^#[0-9a-f]{6}$/i.test(e.target.value)) {
                onChange(e.target.value)
              }
            }}
            placeholder="#000000"
            className="h-8 font-mono text-xs"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface EditingTag {
  id: number
  name: string
  color: string
}

interface TagManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tags: Tag[]
  onCreateTag: (tag: { name: string, color: string }) => void
  onUpdateTag: (tag: { id: number, name?: string, color?: string }) => void
  onDeleteTag: (id: number) => void
  isCreating?: boolean
  isUpdating?: boolean
  isDeleting?: boolean
}

export default function TagManagerDialog({
  open,
  onOpenChange,
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  isCreating,
  isUpdating,
  isDeleting,
}: TagManagerDialogProps) {
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3b82f6')
  const [editingTag, setEditingTag] = useState<EditingTag | null>(null)

  const handleCreate = () => {
    if (!newTagName.trim()) {
      return
    }
    onCreateTag({ name: newTagName.trim(), color: newTagColor })
    setNewTagName('')
    setNewTagColor('#3b82f6')
  }

  const handleStartEdit = (tag: Tag) => {
    setEditingTag({ id: tag.id, name: tag.name, color: tag.color })
  }

  const handleCancelEdit = () => {
    setEditingTag(null)
  }

  const handleSaveEdit = () => {
    if (!editingTag || !editingTag.name.trim()) {
      return
    }
    const originalTag = tags.find(t => t.id === editingTag.id)
    if (!originalTag) {
      return
    }

    const updates: { id: number, name?: string, color?: string } = { id: editingTag.id }
    if (editingTag.name.trim() !== originalTag.name) {
      updates.name = editingTag.name.trim()
    }
    if (editingTag.color !== originalTag.color) {
      updates.color = editingTag.color
    }

    if (updates.name || updates.color) {
      onUpdateTag(updates)
    }
    setEditingTag(null)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      onDeleteTag(id)
      if (editingTag?.id === id) {
        setEditingTag(null)
      }
    }
  }

  const isLoading = isCreating || isUpdating || isDeleting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Create, edit, and delete tags. Customize colors for better organization.
          </DialogDescription>
        </DialogHeader>

        {/* Create new tag */}
        <div className="flex items-center gap-2">
          <ColorPicker color={newTagColor} onChange={setNewTagColor} />
          <Input
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            placeholder="New tag name..."
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreate()
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newTagName.trim() || isCreating}
            className="shrink-0"
          >
            {isCreating
              ? <Loader2 className="size-4 animate-spin" />
              : <Plus className="size-4" />}
          </Button>
        </div>

        {/* Tag list */}
        <ScrollArea className="max-h-[340px]">
          <div className="space-y-1 pr-3">
            {tags.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No tags yet. Create one above.
              </div>
            )}
            {tags.map(tag => (
              <div
                key={tag.id}
                className="group flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 transition-colors hover:bg-accent"
              >
                {editingTag?.id === tag.id
                  ? (
                    <>
                      <ColorPicker
                        color={editingTag.color}
                        onChange={color => setEditingTag({ ...editingTag, color })}
                      />
                      <Input
                        value={editingTag.name}
                        onChange={e => setEditingTag({ ...editingTag, name: e.target.value })}
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit()
                          }
                          if (e.key === 'Escape') {
                            handleCancelEdit()
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 shrink-0 text-green-600 hover:text-green-700"
                        onClick={handleSaveEdit}
                        disabled={!editingTag.name.trim() || isUpdating}
                      >
                        {isUpdating
                          ? <Loader2 className="size-3.5 animate-spin" />
                          : <Check className="size-3.5" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 shrink-0"
                        onClick={handleCancelEdit}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </>
                    )
                  : (
                    <>
                      <Hash className="size-4 shrink-0" style={{ color: tag.color }} />
                      <span className="flex-1 truncate text-sm">{tag.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {tag.pageIds.length}
                      </span>
                      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={() => handleStartEdit(tag)}
                          disabled={isLoading}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(tag.id)}
                          disabled={isLoading}
                        >
                          {isDeleting
                            ? <Loader2 className="size-3.5 animate-spin" />
                            : <Trash2 className="size-3.5" />}
                        </Button>
                      </div>
                    </>
                    )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
