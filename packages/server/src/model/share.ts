import type { ShareLink } from '~/sql/types'

function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function createShareLink(
  DB: D1Database,
  pageId: number,
  expiresAt: Date | null,
): Promise<ShareLink | null> {
  const shareCode = generateShareCode()

  const sql = `
    INSERT INTO share_links (pageId, shareCode, expiresAt)
    VALUES (?, ?, ?)
  `

  const result = await DB.prepare(sql)
    .bind(pageId, shareCode, expiresAt?.toISOString() ?? null)
    .run()

  if (!result.success) {
    return null
  }

  return {
    id: result.meta.last_row_id as number,
    pageId,
    shareCode,
    expiresAt,
    createdAt: new Date(),
  }
}

async function getShareLinkByCode(
  DB: D1Database,
  shareCode: string,
): Promise<ShareLink | null> {
  const sql = `SELECT * FROM share_links WHERE shareCode = ?`
  const result = await DB.prepare(sql).bind(shareCode).first<ShareLink>()
  return result
}

async function getShareLinksByPageId(
  DB: D1Database,
  pageId: number,
): Promise<ShareLink[]> {
  const sql = `SELECT * FROM share_links WHERE pageId = ? ORDER BY createdAt DESC`
  const result = await DB.prepare(sql).bind(pageId).all<ShareLink>()
  return result.results
}

async function getAllShareLinks(
  DB: D1Database,
): Promise<(ShareLink & { pageTitle: string })[]> {
  const sql = `
    SELECT s.*, p.title as pageTitle
    FROM share_links s
    LEFT JOIN pages p ON s.pageId = p.id
    ORDER BY s.createdAt DESC
  `
  const result = await DB.prepare(sql).all<ShareLink & { pageTitle: string }>()
  return result.results
}

async function deleteShareLink(DB: D1Database, id: number): Promise<boolean> {
  const sql = `DELETE FROM share_links WHERE id = ?`
  const result = await DB.prepare(sql).bind(id).run()
  return result.success
}

async function deleteShareLinksByPageId(
  DB: D1Database,
  pageId: number,
): Promise<boolean> {
  const sql = `DELETE FROM share_links WHERE pageId = ?`
  const result = await DB.prepare(sql).bind(pageId).run()
  return result.success
}

function isShareLinkExpired(shareLink: ShareLink): boolean {
  if (!shareLink.expiresAt) {
    return false
  }
  return new Date(shareLink.expiresAt) < new Date()
}

export {
  createShareLink,
  getShareLinkByCode,
  getShareLinksByPageId,
  getAllShareLinks,
  deleteShareLink,
  deleteShareLinksByPageId,
  isShareLinkExpired,
}

