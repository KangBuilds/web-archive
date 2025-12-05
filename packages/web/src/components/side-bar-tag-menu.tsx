import { Badge } from '@web-archive/shared/components/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@web-archive/shared/components/collapsible'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@web-archive/shared/components/context-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuSub } from '@web-archive/shared/components/side-bar'
import type { Tag } from '@web-archive/shared/types'
import { cn } from '@web-archive/shared/utils'
import { useRequest } from 'ahooks'
import { ChevronDown, Pencil, TagIcon, Trash } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import EditTagDialog from './edit-tag-dialog'
import { deleteTag } from '~/data/tag'
import TagContext from '~/store/tag'
import { queryAllPageIds } from '~/data/page'

interface SidebarTagMenuProps {
  selectedFolder: number | null
  selectedTag: number | null
  setSelectedTag: (tag: number | null) => void
}

interface TagBadgeProps {
  tag: Tag
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
  onEdit: () => void
}

function TagBadge({ tag, isSelected, onClick, onDelete, onEdit }: TagBadgeProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Badge
          key={tag.id}
          className={cn(
            'cursor-pointer select-none text-xs px-2.5 py-1 transition-all',
            isSelected
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-secondary/70 text-secondary-foreground hover:bg-secondary border-0',
          )}
          variant={isSelected ? 'default' : 'secondary'}
          onClick={onClick}
        >
          {tag.name}
          <span className="ml-1.5 opacity-60">{tag.pageIds.length}</span>
        </Badge>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-40">
        <ContextMenuItem
          className="flex items-center gap-2 cursor-pointer text-sm"
          onClick={onEdit}
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </ContextMenuItem>
        <ContextMenuItem
          className="flex items-center gap-2 cursor-pointer text-sm text-destructive focus:text-destructive"
          onClick={onDelete}
        >
          <Trash className="w-3.5 h-3.5" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function SidebarTagMenu({ selectedTag, setSelectedTag, selectedFolder }: SidebarTagMenuProps) {
  const { tagCache: tags, refreshTagCache } = useContext(TagContext)
  const [isTagsCollapseOpen, setIsTagsCollapseOpen] = useState(false)

  const handleClickTag = (tagId: number) => {
    if (selectedTag === tagId) {
      setSelectedTag(null)
    }
    else {
      setSelectedTag(tagId)
    }
  }

  const { run: runDelete } = useRequest(deleteTag, {
    manual: true,
    onSuccess() {
      refreshTagCache()
    },
    onError(error) {
      toast.error(error.message)
    },
  })

  const [editTagDialogOpen, setEditTagDialogOpen] = useState(false)
  const [editTag, setEditTag] = useState<Tag>()
  const handleEditTag = (tag: Tag) => {
    setEditTagDialogOpen(true)
    setEditTag(tag)
  }

  const [showTagList, setShowTagList] = useState(tags)
  useEffect(() => {
    if (!selectedFolder) {
      setShowTagList(tags)
      return
    }
    queryAllPageIds(selectedFolder).then((data) => {
      const newTags = tags.filter((tag) => {
        return tag.pageIds.some(pageId => data.includes(pageId))
      })
      setShowTagList(newTags)
    })
  }, [selectedFolder, tags])

  return (
    <SidebarMenu>
      <EditTagDialog
        editTag={editTag}
        afterSubmit={refreshTagCache}
        open={editTagDialogOpen}
        setOpen={setEditTagDialogOpen}
      />
      <Collapsible
        open={isTagsCollapseOpen}
        onOpenChange={setIsTagsCollapseOpen}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="w-full justify-between h-9 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
            <div className="flex items-center text-sm font-medium">
              <TagIcon className="mr-2.5 h-4 w-4" />
              Tags
            </div>
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isTagsCollapseOpen && 'rotate-180')} />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="animate-accordion-down">
          <SidebarMenuSub
            className="mt-2 ml-4 pl-3 border-l border-border/50"
            onContextMenu={e => e.preventDefault()}
          >
            <div className="flex flex-wrap gap-1.5 py-1">
              {showTagList?.length === 0
                ? (
                  <p className="text-xs text-muted-foreground py-2">No tags yet</p>
                  )
                : (
                    showTagList?.map(tag => (
                      <TagBadge
                        key={tag.id}
                        tag={tag}
                        isSelected={selectedTag === tag.id}
                        onClick={() => handleClickTag(tag.id)}
                        onDelete={() => runDelete(tag.id)}
                        onEdit={() => handleEditTag(tag)}
                      />
                    ))
                  )}
            </div>
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenu>
  )
}

export default SidebarTagMenu
