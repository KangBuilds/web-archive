import type { Tag } from '@web-archive/shared/types'
import fetcher from '~/utils/fetcher'

function getAllTag(): Promise<Tag[]> {
  return fetcher<Tag[]>('/tags/all', {
    method: 'GET',
  })
}

function createTag(body: { name: string, color?: string }): Promise<void> {
  return fetcher<void>('/tags/create', {
    method: 'POST',
    body,
  })
}

function deleteTag(tagId: number): Promise<void> {
  return fetcher<void>(`/tags/delete`, {
    method: 'DELETE',
    query: { id: tagId.toString() },
  })
}

function updateTag(body: { id: number, name?: string, color?: string }): Promise<void> {
  return fetcher<void>(`/tags/update`, {
    method: 'POST',
    body,
  })
}

export {
  getAllTag,
  createTag,
  deleteTag,
  updateTag,
}
