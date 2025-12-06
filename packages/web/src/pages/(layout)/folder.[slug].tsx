import { useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FolderOpen, Search, X } from 'lucide-react'
import { isNil } from '@web-archive/shared/utils'
import { ScrollArea } from '@web-archive/shared/components/ui/scroll-area'
import { Button } from '@web-archive/shared/components/ui/button'
import { Input } from '@web-archive/shared/components/ui/input'
import { SidebarTrigger } from '@web-archive/shared/components/ui/sidebar'
import { Separator } from '@web-archive/shared/components/ui/separator'
import { Skeleton } from '@web-archive/shared/components/ui/skeleton'
import type { Page } from '@web-archive/shared/types'
import { useParams } from '~/router'
import NotFound from '~/components/not-found'
import { deletePage, queryPage } from '~/data/page'
import PageCard from '~/components/page-card'

function Header({
  keyword,
  setKeyword,
  handleSearch,
}: {
  keyword: string
  setKeyword: (keyword: string) => void
  handleSearch: () => void
}) {
  const handleClear = () => {
    setKeyword('')
    handleSearch()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 pr-9"
            placeholder="Search in this folder..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {keyword && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={handleSearch} size="sm">
          Search
        </Button>
      </div>
    </header>
  )
}

function PageGrid({
  pages,
  onDelete,
}: {
  pages: Page[]
  onDelete: (page: Page) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pages.map(page => (
        <PageCard key={page.id} page={page} onDelete={onDelete} />
      ))}
    </div>
  )
}

function PageGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({
  keyword,
}: {
  keyword: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <FolderOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">
        {keyword ? 'No results found' : 'Empty folder'}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {keyword
          ? 'Try adjusting your search terms'
          : 'Save pages to this folder using the extension'}
      </p>
    </div>
  )
}

export default function FolderPage() {
  const { slug } = useParams('/folder/:slug')
  const queryClient = useQueryClient()
  const { keyword, searchTrigger, selectedTag, setKeyword, handleSearch }
    = useOutletContext<{
      keyword: string
      searchTrigger: boolean
      selectedTag: number | null
      setKeyword: (keyword: string) => void
      handleSearch: () => void
    }>()

  const PAGE_SIZE = 14

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['folder-pages', slug, keyword, selectedTag],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await queryPage({
        folderId: slug,
        pageNumber: pageParam,
        pageSize: PAGE_SIZE,
        keyword,
        tagId: selectedTag,
      })
      return res
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce((acc, p) => acc + p.list.length, 0)
      if (loadedCount >= lastPage.total)
        return undefined
      return allPages.length + 1
    },
    initialPageParam: 1,
    enabled: !!slug,
  })

  const deletePageMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-pages', slug] })
    },
  })

  useEffect(() => {
    refetch()
  }, [searchTrigger, slug, refetch])

  const pages = useMemo(
    () => data?.pages.flatMap(p => p.list) ?? [],
    [data],
  )
  const total = data?.pages[0]?.total ?? 0

  if (isNil(slug)) {
    return <NotFound />
  }

  return (
    <div className="flex h-svh flex-col">
      <Header
        keyword={keyword}
        setKeyword={setKeyword}
        handleSearch={handleSearch}
      />
      <ScrollArea className="flex-1">
        <div className="p-6">
          {isLoading
            ? (
              <PageGridSkeleton />
              )
            : pages.length === 0
              ? (
                <EmptyState keyword={keyword} />
                )
              : (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {total}
                      {' '}
                      page
                      {total !== 1 ? 's' : ''}
                      {' '}
                      in this folder
                      {keyword && (
                        <span>
                          {' '}
                          matching "
                          <span className="font-medium text-foreground">{keyword}</span>
                          "
                        </span>
                      )}
                    </p>
                  </div>
                  <PageGrid
                    pages={pages}
                    onDelete={page => deletePageMutation.mutate(page)}
                  />
                  {hasNextPage && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                      >
                        {isFetchingNextPage ? 'Loading...' : 'Load more'}
                      </Button>
                    </div>
                  )}
                </div>
                )}
        </div>
      </ScrollArea>
    </div>
  )
}
