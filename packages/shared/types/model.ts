type Page = {
  id: number
  title: string
  contentUrl: string
  pageUrl: string
  folderId: number
  pageDesc: string
  screenshotId: string | null
  isDeleted: number
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
  isShowcased: number
  note: string | null
}

type Folder = {
  id: number
  name: string
  isDeleted: number
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

type Tag = {
  id: number
  name: string
  color: string
  pageIds: Array<number>
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

export type { Page, Folder, Tag, ShareLink }
