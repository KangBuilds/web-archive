import { memo, useContext, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useOutletContext } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, X } from 'lucide-react'
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
import { Textarea } from '@web-archive/shared/components/ui/textarea'
import { Label } from '@web-archive/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web-archive/shared/components/ui/select'
import { Badge } from '@web-archive/shared/components/ui/badge'
import { Skeleton } from '@web-archive/shared/components/ui/skeleton'
import TagContext from '~/store/tag'
import { getPageDetail, updatePage } from '~/data/page'
import { getAllFolder } from '~/data/folder'

interface CardEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pageId: number
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  pageDesc: z.string(),
  pageUrl: z.string().min(1, 'Page URL is required'),
  folderId: z.string().min(1, 'Folder is required'),
  note: z.string().nullable(),
  bindTags: z.array(z.string()),
  unbindTags: z.array(z.string()),
})

type FormData = z.infer<typeof formSchema>

function CardEditDialogComponent({
  open,
  onOpenChange,
  pageId,
}: CardEditDialogProps) {
  const queryClient = useQueryClient()
  const { handleSearch } = useOutletContext<{ handleSearch: () => void }>()
  const { tagCache, refreshTagCache } = useContext(TagContext)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [newTagInput, setNewTagInput] = useState('')
  const [newTags, setNewTags] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      pageDesc: '',
      pageUrl: '',
      folderId: '',
      note: null,
      bindTags: [],
      unbindTags: [],
    },
  })

  // Queries
  const { data: pageDetail, isLoading: pageLoading } = useQuery({
    queryKey: ['page-detail', pageId],
    queryFn: () => getPageDetail(pageId.toString()),
    enabled: open,
  })

  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['folders'],
    queryFn: getAllFolder,
    enabled: open,
  })

  // Mutation
  const updatePageMutation = useMutation({
    mutationFn: updatePage,
    onSuccess: () => {
      toast.success('Page updated successfully')
      refreshTagCache()
      queryClient.invalidateQueries({ queryKey: ['search-pages'] })
      queryClient.invalidateQueries({ queryKey: ['recent-pages'] })
      handleSearch()
      onOpenChange(false)
    },
  })

  // Reset form to defaults when pageId changes (before new data loads)
  useEffect(() => {
    reset({
      title: '',
      pageDesc: '',
      pageUrl: '',
      folderId: '',
      note: null,
      bindTags: [],
      unbindTags: [],
    })
    setSelectedTagIds([])
    setNewTags([])
    setNewTagInput('')
  }, [pageId, reset])

  // Set form values when page detail is loaded
  useEffect(() => {
    if (pageDetail && folders.length > 0) {
      reset({
        title: pageDetail.title,
        pageDesc: pageDetail.pageDesc || '',
        pageUrl: pageDetail.pageUrl,
        folderId: pageDetail.folderId != null ? pageDetail.folderId.toString() : '',
        note: pageDetail.note ?? null,
        bindTags: [],
        unbindTags: [],
      })
      // Set initially selected tags
      const initialTags = tagCache?.filter(tag =>
        tag.pageIds.includes(pageId),
      )
      setSelectedTagIds(initialTags?.map(t => t.id) || [])
      // Reset new tags
      setNewTags([])
      setNewTagInput('')
    }
  }, [pageDetail, folders, pageId, tagCache, reset])

  const handleAddNewTag = () => {
    const trimmedTag = newTagInput.trim()
    if (!trimmedTag)
      return

    // Check if tag already exists in cache or new tags
    const existsInCache = tagCache?.some(t => t.name.toLowerCase() === trimmedTag.toLowerCase())
    const existsInNewTags = newTags.some(t => t.toLowerCase() === trimmedTag.toLowerCase())

    if (existsInCache) {
      // If it exists in cache, just select it
      const existingTag = tagCache?.find(t => t.name.toLowerCase() === trimmedTag.toLowerCase())
      if (existingTag && !selectedTagIds.includes(existingTag.id)) {
        setSelectedTagIds([...selectedTagIds, existingTag.id])
        const wasOriginallySelected = existingTag.pageIds.includes(pageId)
        if (!wasOriginallySelected) {
          setValue('bindTags', [...watch('bindTags'), existingTag.name])
          setValue('unbindTags', watch('unbindTags').filter(t => t !== existingTag.name))
        }
      }
      setNewTagInput('')
      return
    }

    if (existsInNewTags) {
      setNewTagInput('')
      return
    }

    // Add new tag
    setNewTags([...newTags, trimmedTag])
    setValue('bindTags', [...watch('bindTags'), trimmedTag])
    setNewTagInput('')
  }

  const handleRemoveNewTag = (tagName: string) => {
    setNewTags(newTags.filter(t => t !== tagName))
    setValue('bindTags', watch('bindTags').filter(t => t !== tagName))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddNewTag()
    }
  }

  const handleTagToggle = (tagId: number) => {
    const isCurrentlySelected = selectedTagIds.includes(tagId)
    const wasOriginallySelected = tagCache
      ?.find(t => t.id === tagId)
      ?.pageIds.includes(pageId)

    if (isCurrentlySelected) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId))
      if (wasOriginallySelected) {
        const tagName = tagCache?.find(t => t.id === tagId)?.name || ''
        setValue('unbindTags', [...watch('unbindTags'), tagName])
        setValue(
          'bindTags',
          watch('bindTags').filter(t => t !== tagName),
        )
      }
    }
    else {
      setSelectedTagIds([...selectedTagIds, tagId])
      if (!wasOriginallySelected) {
        const tagName = tagCache?.find(t => t.id === tagId)?.name || ''
        setValue('bindTags', [...watch('bindTags'), tagName])
        setValue(
          'unbindTags',
          watch('unbindTags').filter(t => t !== tagName),
        )
      }
    }
  }

  const onSubmit = (data: FormData) => {
    updatePageMutation.mutate({
      id: pageId,
      title: data.title,
      pageDesc: data.pageDesc,
      pageUrl: data.pageUrl,
      folderId: Number.parseInt(data.folderId),
      isShowcased: 0,
      note: data.note,
      bindTags: data.bindTags,
      unbindTags: data.unbindTags,
    })
  }

  const isLoading = pageLoading || foldersLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Page</DialogTitle>
          <DialogDescription>
            Update the details of this archived page.
          </DialogDescription>
        </DialogHeader>

        {isLoading
          ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            )
          : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter page title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageDesc">Description</Label>
                <Textarea
                  id="pageDesc"
                  {...register('pageDesc')}
                  placeholder="Enter page description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageUrl">Page URL</Label>
                <Input
                  id="pageUrl"
                  {...register('pageUrl')}
                  placeholder="Enter page URL"
                />
                {errors.pageUrl && (
                  <p className="text-sm text-destructive">
                    {errors.pageUrl.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  {...register('note')}
                  placeholder="Add your personal notes (optional)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="folder">Folder</Label>
                <Controller
                  name="folderId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a folder" />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map(folder => (
                          <SelectItem key={folder.id} value={folder.id.toString()}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.folderId && (
                  <p className="text-sm text-destructive">{errors.folderId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tagCache?.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={
                      selectedTagIds.includes(tag.id) ? 'default' : 'outline'
                    }
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {newTags.map(tagName => (
                    <Badge
                      key={tagName}
                      variant="default"
                      className="cursor-pointer gap-1"
                    >
                      {tagName}
                      <X
                        className="h-3 w-3"
                        onClick={() => handleRemoveNewTag(tagName)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new tag..."
                    value={newTagInput}
                    onChange={e => setNewTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddNewTag}
                    disabled={!newTagInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
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
                <Button type="submit" disabled={updatePageMutation.isPending}>
                  {updatePageMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save changes
                </Button>
              </DialogFooter>
            </form>
            )}
      </DialogContent>
    </Dialog>
  )
}

const CardEditDialog = memo(CardEditDialogComponent)
export default CardEditDialog
