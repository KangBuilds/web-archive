import { memo, useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useOutletContext } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
  folderId: z.string(),
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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      pageDesc: '',
      pageUrl: '',
      folderId: '',
      bindTags: [],
      unbindTags: [],
    },
  })

  const folderId = watch('folderId')

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

  // Set form values when page detail is loaded
  useEffect(() => {
    if (pageDetail) {
      reset({
        title: pageDetail.title,
        pageDesc: pageDetail.pageDesc || '',
        pageUrl: pageDetail.pageUrl,
        folderId: pageDetail.folderId.toString(),
        bindTags: [],
        unbindTags: [],
      })
      // Set initially selected tags
      const initialTags = tagCache?.filter(tag =>
        tag.pageIds.includes(pageId),
      )
      setSelectedTagIds(initialTags?.map(t => t.id) || [])
    }
  }, [pageDetail, pageId, tagCache, reset])

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
                <Label htmlFor="folder">Folder</Label>
                <Select
                  value={folderId}
                  onValueChange={value => setValue('folderId', value)}
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
                  {(!tagCache || tagCache.length === 0) && (
                    <p className="text-sm text-muted-foreground">No tags available</p>
                  )}
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
