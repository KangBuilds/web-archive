import { isNil } from '@web-archive/shared/utils'
import { useOutletContext } from 'react-router-dom'
import { useInfiniteScroll, useRequest } from 'ahooks'
import React, { useContext, useEffect, useRef } from 'react'
import type { Ref } from '@web-archive/shared/components/scroll-area'
import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import { Button } from '@web-archive/shared/components/button'
import { FolderOpen, Trash2 } from 'lucide-react'
import type { Page } from '@web-archive/shared/types'
import { useNavigate, useParams } from '~/router'
import NotFound from '~/components/not-found'
import LoadingWrapper from '~/components/loading-wrapper'
import { deletePage, queryPage } from '~/data/page'
import CardView from '~/components/card-view'
import EmptyWrapper from '~/components/empty-wrapper'
import ListView from '~/components/list-view'
import AppContext from '~/store/app'
import LoadingMore from '~/components/loading-more'
import Header from '~/components/header'

function FolderPage() {
  const { slug } = useParams('/folder/:slug')
  const scrollRef = useRef<Ref>(null)
  const { keyword, searchTrigger, selectedTag } = useOutletContext<{
    keyword: string
    searchTrigger: boolean
    selectedTag: number | null
  }>()

  const PAGE_SIZE = 14
  const { data: pagesData, loading: pagesLoading, mutate: setPageData, loadingMore, reload } = useInfiniteScroll(
    async (d) => {
      const pageNumber = d?.pageNumber ?? 1
      const res = await queryPage({
        folderId: slug,
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
  }, [searchTrigger, slug])

  const { run: handleDeletePage } = useRequest(deletePage, {
    manual: true,
    onSuccess: (data) => {
      setPageData({ list: pagesData?.list.filter(page => page.id !== data?.id) ?? [] })
    },
  })

  const navigate = useNavigate()
  const handleItemClick = (page: Page, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey)
      window.open(`/#/page/${page.id}`, '_blank')
    else
      navigate(`/page/:slug`, { params: { slug: String(page.id) } })
  }

  const { view } = useContext(AppContext)
  const { setKeyword, handleSearch } = useOutletContext<{
    keyword: string
    setKeyword: (keyword: string) => void
    handleSearch: () => void
  }>()

  if (isNil(slug))
    return <NotFound />

  const totalPages = pagesData?.total ?? 0

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header keyword={keyword} setKeyword={setKeyword} handleSearch={handleSearch} />

      <ScrollArea ref={scrollRef} className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Results info */}
          {!pagesLoading && pagesData && (
            <div className="mb-4 animate-fade-up">
              <p className="text-sm text-muted-foreground">
                {totalPages}
                {' '}
                page
                {totalPages !== 1 ? 's' : ''}
                {' '}
                in this folder
                {keyword && (
                  <span className="ml-1">
                    matching "
                    <span className="text-foreground font-medium">{keyword}</span>
                    "
                  </span>
                )}
              </p>
            </div>
          )}

          <LoadingWrapper loading={pagesLoading || !pagesData}>
            <EmptyWrapper
              empty={pagesData?.list.length === 0}
              emptyElement={(
                <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <FolderOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-foreground mb-1">
                    {keyword ? 'No results found' : 'Empty folder'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {keyword
                      ? 'Try adjusting your search terms'
                      : 'Save pages to this folder using the extension'}
                  </p>
                </div>
              )}
            >
              {view === 'card'
                ? (
                  <CardView pages={pagesData?.list} onPageDelete={handleDeletePage} />
                  )
                : (
                  <ListView pages={pagesData?.list} onItemClick={handleItemClick} imgPreview>
                    {page => (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePage(page)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </ListView>
                  )}
              {loadingMore && <LoadingMore />}
            </EmptyWrapper>
          </LoadingWrapper>
        </div>
      </ScrollArea>
    </div>
  )
}

export default FolderPage
