import { useInfiniteScroll, useRequest } from 'ahooks'
import type { Ref } from '@web-archive/shared/components/scroll-area'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Page } from '@web-archive/shared/types'
import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import { useOutletContext } from 'react-router-dom'
import { isNil, isNotNil } from '@web-archive/shared/utils'
import { Archive } from 'lucide-react'
import { useMediaQuery } from '~/hooks/useMediaQuery'
import { deletePage, getRecentSavePage, queryPage } from '~/data/page'
import PageCard from '~/components/page-card'
import Header from '~/components/header'
import LoadingWrapper from '~/components/loading-wrapper'
import CardView from '~/components/card-view'
import LoadingMore from '~/components/loading-more'
import { useShouldShowRecent } from '~/hooks/useShouldShowRecent'

function RecentSavePageView() {
  const { shouldShowRecent } = useShouldShowRecent()
  const [pages, setPages] = useState<Page[]>([])
  useRequest(getRecentSavePage, {
    onSuccess: (data) => {
      setPages(data ?? [])
    },
    ready: shouldShowRecent,
  })

  const { '2xl': is2xlScreen, xl: isXlScreen, md: isMdScreen } = useMediaQuery()

  const columnCount = useMemo(() => {
    if (is2xlScreen)
      return 4
    if (isXlScreen)
      return 3
    if (isMdScreen)
      return 2
    return 1
  }, [is2xlScreen, isXlScreen, isMdScreen])

  const { run: handleDeletePage } = useRequest(deletePage, {
    manual: true,
    onSuccess: (data) => {
      setPages(pages.filter(page => page.id !== data?.id))
    },
  })

  const reorganizedPages = useMemo(() => {
    const result = Array.from({ length: columnCount }, () => [])
    return result.map((_, idx) =>
      pages
        .filter((_, index) => index % columnCount === idx)
        .map(page => (
          <PageCard key={page.id} page={page} onPageDelete={handleDeletePage} />
        )),
    )
  }, [pages, columnCount, handleDeletePage])

  return (
    <ScrollArea className="overflow-auto h-[calc(100vh-58px)]">
      <div className="p-6 space-y-8">
        {/* Recent Pages Section */}
        {shouldShowRecent && pages.length > 0 && (
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-semibold text-foreground">Recently Saved</h2>
              <span className="text-sm text-muted-foreground">Latest captures</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {reorganizedPages.map((columnPages, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  {columnPages}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no recent pages */}
        {shouldShowRecent && pages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Archive className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-medium text-foreground mb-1">No recent pages</h3>
            <p className="text-sm text-muted-foreground">Start archiving pages with the browser extension</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

function SearchPageView() {
  const scrollRef = useRef<Ref>(null)
  const { keyword, searchTrigger, selectedTag } = useOutletContext<{
    keyword: string
    searchTrigger: boolean
    selectedTag: number | null
    setKeyword: (keyword: string) => void
    handleSearch: () => void
  }>()

  const PAGE_SIZE = 14
  const { data: pagesData, loading: pagesLoading, mutate: setPageData, loadingMore, reload } = useInfiniteScroll(
    async (d) => {
      const pageNumber = d?.pageNumber ?? 1
      const res = await queryPage({
        pageNumber,
        pageSize: PAGE_SIZE,
        keyword,
        tagId: selectedTag,
      })
      return {
        list: res.list ?? [],
        pageNumber: pageNumber + 1,
        total: res.total,
      }
    },
    {
      target: scrollRef.current?.viewport,
      isNoMore: (d) => {
        if (!d)
          return false
        return d.list.length >= d.total || d.pageNumber > Math.ceil(d.total / PAGE_SIZE)
      },
    },
  )

  useEffect(() => {
    reload()
  }, [searchTrigger])

  const { run: handleDeletePage } = useRequest(deletePage, {
    manual: true,
    onSuccess: (data) => {
      setPageData({ list: pagesData?.list.filter(page => page.id !== data?.id) ?? [] })
    },
  })

  const totalResults = pagesData?.total ?? 0

  return (
    <ScrollArea ref={scrollRef} className="overflow-auto h-[calc(100vh-58px)]">
      <div className="p-6">
        {/* Search results header */}
        <div className="mb-6 animate-fade-up">
          <p className="text-sm text-muted-foreground">
            {pagesLoading ? 'Searching...' : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''}`}
            {keyword && (
              <span className="ml-1">
                for "
                <span className="text-foreground font-medium">{keyword}</span>
                "
              </span>
            )}
          </p>
        </div>

        <LoadingWrapper loading={pagesLoading || !pagesData}>
          <div className="h-full">
            <CardView pages={pagesData?.list} onPageDelete={handleDeletePage} />
            {loadingMore && <LoadingMore />}
          </div>
        </LoadingWrapper>
      </div>
    </ScrollArea>
  )
}

function ArchiveHome() {
  const { keyword, selectedTag, setKeyword, handleSearch } = useOutletContext<{
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
    <div className="flex flex-col flex-1 min-h-0">
      <Header keyword={keyword} setKeyword={setKeyword} handleSearch={handleStartSearch} />
      {showSearchView ? <SearchPageView /> : <RecentSavePageView />}
    </div>
  )
}

export default ArchiveHome
