import type { ShareLink, ShareLinkWithPage } from '@web-archive/shared/types'
import fetcher from '~/utils/fetcher'

function createShareLink(pageId: number, expiresIn: number | null): Promise<ShareLink> {
  return fetcher<ShareLink>('/shares/create', {
    method: 'POST',
    body: {
      pageId,
      expiresIn,
    },
  })
}

function getShareLinksForPage(pageId: number): Promise<ShareLink[]> {
  return fetcher<ShareLink[]>(`/shares/page/${pageId}`, {
    method: 'GET',
  })
}

function deleteShareLink(id: number): Promise<{ id: number }> {
  return fetcher<{ id: number }>(`/shares/${id}`, {
    method: 'DELETE',
  })
}

function getAllShareLinks(): Promise<ShareLinkWithPage[]> {
  return fetcher<ShareLinkWithPage[]>('/shares/all', {
    method: 'GET',
  })
}

function getShareUrl(shareCode: string): string {
  return `${window.location.origin}/share/${shareCode}`
}

export {
  createShareLink,
  getShareLinksForPage,
  getAllShareLinks,
  deleteShareLink,
  getShareUrl,
}

