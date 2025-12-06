import { Outlet } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import {
  SidebarInset,
  SidebarProvider,
} from '@web-archive/shared/components/ui/sidebar'
import AppSidebar from '~/components/app-sidebar'
import { getAllTag } from '~/data/tag'
import TagContext from '~/store/tag'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
})

function LayoutContent() {
  const [keyword, setKeyword] = useState('')
  const [searchTrigger, setSearchTrigger] = useState(false)

  const handleSearch = () => {
    setSearchTrigger(prev => !prev)
  }

  const { data: tagCache, refetch: refreshTagCache } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTag,
  })

  const [selectedTag, setSelectedTag] = useState<number | null>(null)

  const setSelectedTagAndReload = (tag: number | null) => {
    setSelectedTag(tag)
    handleSearch()
  }

  return (
    <TagContext.Provider
      value={useMemo(
        () => ({
          tagCache: tagCache || [],
          refreshTagCache,
        }),
        [tagCache, refreshTagCache],
      )}
    >
      <SidebarProvider>
        <AppSidebar
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTagAndReload}
        />
        <SidebarInset>
          <Outlet
            context={{
              keyword,
              searchTrigger,
              handleSearch,
              setKeyword,
              selectedTag,
            }}
          />
        </SidebarInset>
      </SidebarProvider>
    </TagContext.Provider>
  )
}

function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LayoutContent />
    </QueryClientProvider>
  )
}

export default Layout
