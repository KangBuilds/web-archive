import type { Page } from '@web-archive/shared/types'
import fetcher from '~/utils/fetcher'

function getPageDetail(id: string): Promise<Page> {
  return fetcher<Page>('/pages/detail', {
    method: 'GET',
    query: {
      id,
    },
  })
}

function deletePage(page: Page): Promise<Page> {
  return fetcher<Page>('/pages/delete_page', {
    method: 'DELETE',
    query: {
      id: page.id.toString(),
    },
  })
}

function queryPage(body: {
  folderId?: string
  pageNumber: number
  pageSize: number
  keyword: string
  tagId: number | null
}): Promise<{
  list: Page[]
  total: number
}> {
  return fetcher<{
    list: Page[]
    total: number
  }>('/pages/query', {
    method: 'POST',
    body,
  })
}

function updatePage(body: {
  id: number
  folderId: number
  title: string
  isShowcased: number
  pageDesc?: string
  pageUrl?: string
  note?: string | null
  bindTags?: string[]
  unbindTags?: string[]
}): Promise<Page> {
  return fetcher<Page>('/pages/update_page', {
    method: 'PUT',
    body,
  })
}

function getRecentSavePage(): Promise<Page[]> {
  return fetcher<Page[]>('/pages/recent_save', {
    method: 'GET',
  })
}

function queryAllPageIds(folderId: number): Promise<number[]> {
  return fetcher<number[]>('/pages/query_all_page_ids', {
    method: 'POST',
    body: {
      folderId,
    },
  })
}

export {
  getPageDetail,
  deletePage,
  queryPage,
  updatePage,
  getRecentSavePage,
  queryAllPageIds,
}
