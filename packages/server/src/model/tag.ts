import { isNil } from '@web-archive/shared/utils'
import type { Tag } from '~/sql/types'

async function selectAllTags(DB: D1Database) {
  const sql = `
    SELECT 
      tags.*,
      GROUP_CONCAT(page_tags.page_id) as page_ids
    FROM tags
    LEFT JOIN page_tags ON tags.id = page_tags.tag_id
    GROUP BY tags.id
  `
  const sqlResult = await DB.prepare(sql).all<Tag & { page_ids: string }>()
  if (sqlResult.error) {
    throw sqlResult.error
  }
  const tagList = sqlResult.results.map((tag) => {
    return {
      ...tag,
      pageIds: tag.page_ids ? tag.page_ids.split(',').map(Number) : [],
    }
  })
  return tagList
}

async function getTagById(DB: D1Database, id: number) {
  const sql = `
    SELECT 
      tags.*,
      GROUP_CONCAT(page_tags.page_id) as page_ids
    FROM tags
    LEFT JOIN page_tags ON tags.id = page_tags.tag_id
    WHERE tags.id = ?
    GROUP BY tags.id
  `
  const tag = await DB.prepare(sql).bind(id).first<Tag & { page_ids: string }>()
  return {
    ...tag,
    pageIds: tag.page_ids ? tag.page_ids.split(',').map(Number) : [],
  }
}

async function insertTag(DB: D1Database, options: { name: string, color: string }) {
  const { name, color } = options
  const sql = `
    INSERT INTO tags (name, color) 
    VALUES (?, ?)
  `
  const sqlResult = await DB.prepare(sql).bind(name, color).run()
  return sqlResult.success
}

async function updateTag(DB: D1Database, options: { id: number, name?: string, color?: string }) {
  const { id, name, color } = options
  if (isNil(id)) {
    throw new Error('Tag id is required')
  }
  if (isNil(name) && isNil(color)) {
    throw new Error('At least one field is required')
  }
  let sql = `
    UPDATE tags
    SET 
  `
  const bindParams: (number | string)[] = []
  if (name) {
    sql += `name = ?, `
    bindParams.push(name)
  }
  if (color) {
    sql += `color = ?, `
    bindParams.push(color)
  }
  sql = `${sql.slice(0, -2)} WHERE id = ?`
  bindParams.push(id)
  const sqlResult = await DB.prepare(sql).bind(...bindParams).run()
  return sqlResult.success
}

async function deleteTagById(DB: D1Database, id: number) {
  const sql = `
    DELETE FROM tags
    WHERE id = ?
  `
  const sqlResult = await DB.prepare(sql).bind(id).run()
  return sqlResult.success
}

interface TagBindRecord {
  tagName: string
  pageIds: Array<number>
}

function generateUpdateTagSql(
  DB: D1Database,
  bindList: Array<TagBindRecord>,
  unbindList: Array<TagBindRecord>,
) {
  const commands: D1PreparedStatement[] = []

  // Create tags if they don't exist and bind pages
  for (const { tagName, pageIds } of bindList) {
    // First, ensure the tag exists
    const createTagStmt = DB.prepare(`
      INSERT INTO tags (name) VALUES (?)
      ON CONFLICT(name) DO NOTHING
    `)
    commands.push(createTagStmt.bind(tagName))

    // Then bind each page to the tag
    for (const pageId of pageIds) {
      const bindStmt = DB.prepare(`
        INSERT INTO page_tags (page_id, tag_id)
        SELECT ?, id FROM tags WHERE name = ?
        ON CONFLICT DO NOTHING
      `)
      commands.push(bindStmt.bind(pageId, tagName))
    }
  }

  // Unbind pages from tags
  for (const { tagName, pageIds } of unbindList) {
    for (const pageId of pageIds) {
      const unbindStmt = DB.prepare(`
        DELETE FROM page_tags 
        WHERE page_id = ? AND tag_id = (SELECT id FROM tags WHERE name = ?)
      `)
      commands.push(unbindStmt.bind(pageId, tagName))
    }
  }

  return commands
}

async function updateBindPageByTagName(
  DB: D1Database,
  bindList: Array<TagBindRecord>,
  unbindList: Array<TagBindRecord>,
) {
  const commands = generateUpdateTagSql(DB, bindList, unbindList)
  if (commands.length === 0) {
    return true
  }

  const updateResult = await DB.batch(commands)
  return updateResult.every(result => result.success)
}

export {
  selectAllTags,
  insertTag,
  getTagById,
  updateTag,
  deleteTagById,
  updateBindPageByTagName,
  generateUpdateTagSql,
  TagBindRecord,
}
