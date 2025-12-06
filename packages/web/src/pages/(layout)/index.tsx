import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive, Search, X } from 'lucide-react'
import type { Page } from '@web-archive/shared/types'
import { isNil, isNotNil } from '@web-archive/shared/utils'
import { ScrollArea } from '@web-archive/shared/components/ui/scroll-area'
import { Button } from '@web-archive/shared/components/ui/button'
import { Input } from '@web-archive/shared/components/ui/input'
import { SidebarTrigger } from '@web-archive/shared/components/ui/sidebar'
import { Separator } from '@web-archive/shared/components/ui/separator'
import { Skeleton } from '@web-archive/shared/components/ui/skeleton'
import { deletePage, getRecentSavePage, queryPage } from '~/data/page'
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
            placeholder="Search pages..."
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
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Archive className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function RecentPagesView() {
  const queryClient = useQueryClient()

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['recent-pages'],
    queryFn: getRecentSavePage,
  })

  const deletePageMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-pages'] })
    },
  })

  if (isLoading) {
    return <PageGridSkeleton />
  }

  if (pages.length === 0) {
    return (
      <EmptyState
        title="No pages yet"
        description="Start archiving pages with the browser extension"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Recently Saved</h2>
        <p className="text-sm text-muted-foreground">Latest captures</p>
      </div>
      <PageGrid pages={pages} onDelete={page => deletePageMutation.mutate(page)} />
    </div>
  )
}

function SearchResultsView({
  keyword,
  selectedTag,
  searchTrigger,
}: {
  keyword: string
  selectedTag: number | null
  searchTrigger: boolean
}) {
  const queryClient = useQueryClient()
  const PAGE_SIZE = 14

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['search-pages', keyword, selectedTag, searchTrigger],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await queryPage({
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
  })

  const deletePageMutation = useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-pages'] })
    },
  })

  const pages = useMemo(
    () => data?.pages.flatMap(p => p.list) ?? [],
    [data],
  )
  const total = data?.pages[0]?.total ?? 0

  if (isLoading) {
    return <PageGridSkeleton />
  }

  if (pages.length === 0) {
    return (
      <EmptyState
        title="No results found"
        description="Try adjusting your search terms"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Found
          {' '}
          {total}
          {' '}
          result
          {total !== 1 ? 's' : ''}
          {keyword && (
            <span>
              {' '}
              for "
              <span className="font-medium text-foreground">{keyword}</span>
              "
            </span>
          )}
        </p>
      </div>
      <PageGrid pages={pages} onDelete={page => deletePageMutation.mutate(page)} />
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
  )
}

export default function HomePage() {
  const { keyword, searchTrigger, selectedTag, setKeyword, handleSearch }
    = useOutletContext<{
      keyword: string
      searchTrigger: boolean
      selectedTag: number | null
      setKeyword: (keyword: string) => void
      handleSearch: () => void
    }>()

  const [showSearchView, setShowSearchView] = useState(false)

  const handleStartSearch = () => {
    if (isNil(keyword) || keyword === '') {
      setShowSearchView(false)
    }
    else {
      setShowSearchView(true)
      handleSearch()
    }
  }

  useEffect(() => {
    setShowSearchView(isNotNil(selectedTag))
  }, [selectedTag])

  return (
    <div className="flex h-svh flex-col">
      <Header
        keyword={keyword}
        setKeyword={setKeyword}
        handleSearch={handleStartSearch}
      />
      <ScrollArea className="flex-1">
        <div className="p-6">
          {showSearchView
            ? (
              <SearchResultsView
                keyword={keyword}
                selectedTag={selectedTag}
                searchTrigger={searchTrigger}
              />
              )
            : (
              <RecentPagesView />
              )}
        </div>
      </ScrollArea>
    </div>
  )
}
