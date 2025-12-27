type Tag = {
  id: number
  name: string
  pageIdDict: string
  createdAt: Date
  updatedAt: Date
}

type ShareLink = {
  id: number
  pageId: number
  shareCode: string
  expiresAt: Date | null
  createdAt: Date
}

export type { Page, Folder } from '@web-archive/shared/types/model'
export type { Tag, ShareLink }
