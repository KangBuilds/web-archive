import { createHash } from 'node:crypto'
import { ConfigKey } from '@web-archive/shared/types'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// In-memory cache for verified token hashes.
// Cloudflare Workers reuse isolates across requests, so this cache
// persists for the lifetime of the isolate (typically minutes to hours).
// This avoids a D1 query on every single API request.
const TOKEN_CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes
const verifiedTokenCache = new Map<string, number>() // hash -> expiry timestamp

function isTokenCached(hash: string): boolean {
  const expiry = verifiedTokenCache.get(hash)
  if (expiry && Date.now() < expiry) {
    return true
  }
  if (expiry) {
    verifiedTokenCache.delete(hash)
  }
  return false
}

function cacheToken(hash: string): void {
  verifiedTokenCache.set(hash, Date.now() + TOKEN_CACHE_TTL_MS)
}

function invalidateTokenCache(): void {
  verifiedTokenCache.clear()
}

async function checkAdminExist(DB: D1Database): Promise<boolean> {
  const result: { count: number } = await DB.prepare(`SELECT COUNT(*) as count FROM stores WHERE key = 'ADMIN_TOKEN'`).first()
  return result.count > 0
}

async function verifyAdminToken(DB: D1Database, token: string): Promise<'new' | 'fail' | 'reject' | 'accept'> {
  if (typeof token !== 'string' || token.length < 8)
    return 'reject'
  const hash = hashToken(token)

  // Fast path: return immediately if this token was recently verified
  if (isTokenCached(hash)) {
    return 'accept'
  }

  const result: { count: number } = await DB.prepare(`SELECT COUNT(*) as count FROM stores WHERE key = 'ADMIN_TOKEN' AND value = ?`).bind(hash).first()
  if (result.count > 0) {
    cacheToken(hash)
    return 'accept'
  }
  const exist = await checkAdminExist(DB)
  if (!exist) {
    const success = await setAdminToken(DB, hash)
    return success ? 'new' : 'fail'
  }
  return 'reject'
}

async function setAdminToken(DB: D1Database, token: string): Promise<boolean> {
  const exist = await checkAdminExist(DB)
  if (exist) {
    throw new Error('Admin token already exists')
  }
  const result = await DB.prepare(`INSERT INTO stores (key, value) VALUES ('ADMIN_TOKEN', ?)`).bind(token).run()
  if (result.success) {
    invalidateTokenCache()
  }
  return result.success
}

async function getShouldShowRecent(DB: D1Database): Promise<boolean> {
  const result = await DB.prepare(`SELECT value FROM stores WHERE key = '${ConfigKey.shouldShowRecent}'`).all<{ value: string }>()
  if (!result.success) {
    throw result.error
  }
  if (result.results.length === 0) {
    return true
  }
  return result.results[0].value === 'true'
}

async function setShouldShowRecent(DB: D1Database, value: boolean): Promise<boolean> {
  const bindValue = value ? 'true' : 'false'
  const insertSql = `INSERT INTO stores (key, value) VALUES ('${ConfigKey.shouldShowRecent}', ?) ON CONFLICT(key) DO UPDATE SET value = ?`
  const result = await DB.prepare(insertSql).bind(bindValue, bindValue).run()
  if (!result.success) {
    throw result.error
  }
  return result.success
}

export {
  checkAdminExist,
  verifyAdminToken,
  setAdminToken,
  getShouldShowRecent,
  setShouldShowRecent,
}
