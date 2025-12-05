import { useInfiniteScroll } from 'ahooks'
import { useRef } from 'react'
import type { Ref } from '@web-archive/shared/components/scroll-area'
import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import { SquareLibrary } from 'lucide-react'
import LoadingWrapper from '~/components/loading-wrapper'
import CardView from '~/components/card-view'
import EmptyWrapper from '~/components/empty-wrapper'
import { queryShowcase } from '~/data/showcase'
import LoadingMore from '~/components/loading-more'
import PoweredBy from '~/components/powerd-by'

function ShowcaseFolderPage() {
  const scrollRef = useRef<Ref>(null)
  const PAGE_SIZE = 14
  const { data: pagesData, loading: pagesLoading, loadingMore } = useInfiniteScroll(
    async (d) => {
      const pageNumber = d?.pageNumber ?? 1
      const res = await queryShowcase({
        pageNumber,
        pageSize: PAGE_SIZE,
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

  const totalPages = pagesData?.total ?? 0

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PoweredBy />

      <ScrollArea ref={scrollRef} className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header info */}
          {!pagesLoading && pagesData && (
            <div className="mb-6 animate-fade-up">
              <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Showcase</h1>
              <p className="text-sm text-muted-foreground">
                {totalPages}
                {' '}
                shared page
                {totalPages !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          <LoadingWrapper loading={pagesLoading || !pagesData}>
            <EmptyWrapper
              empty={pagesData?.list.length === 0}
              emptyElement={(
                <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <SquareLibrary className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-foreground mb-1">No showcased pages</h3>
                  <p className="text-sm text-muted-foreground">Share pages to see them here</p>
                </div>
              )}
            >
              <CardView pages={pagesData?.list} onPageDelete={() => {}} />
              {loadingMore && <LoadingMore />}
            </EmptyWrapper>
          </LoadingWrapper>
        </div>
      </ScrollArea>
    </div>
  )
}

export default ShowcaseFolderPage
