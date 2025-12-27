import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { isNil, isNumberString } from '@web-archive/shared/utils'
import type { HonoTypeUserInformation } from '~/constants/binding'
import result from '~/utils/result'
import {
  createShareLink,
  deleteShareLink,
  getShareLinksByPageId,
} from '~/model/share'

const app = new Hono<HonoTypeUserInformation>()

app.post(
  '/create',
  validator('json', (value, c) => {
    if (!isNumberString(value.pageId)) {
      return c.json(result.error(400, 'Page ID should be a number'))
    }

    // expiresIn is in hours, null or 0 means never expires
    if (value.expiresIn !== null && value.expiresIn !== undefined) {
      if (typeof value.expiresIn !== 'number' || value.expiresIn < 0) {
        return c.json(result.error(400, 'expiresIn should be a positive number or null'))
      }
    }

    return {
      pageId: Number(value.pageId),
      expiresIn: value.expiresIn as number | null | undefined,
    }
  }),
  async (c) => {
    const { pageId, expiresIn } = c.req.valid('json')

    let expiresAt: Date | null = null
    if (expiresIn && expiresIn > 0) {
      expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000)
    }

    const shareLink = await createShareLink(c.env.DB, pageId, expiresAt)

    if (isNil(shareLink)) {
      return c.json(result.error(500, 'Failed to create share link'))
    }

    return c.json(result.success(shareLink))
  },
)

app.get(
  '/page/:pageId',
  validator('param', (value, c) => {
    if (!isNumberString(value.pageId)) {
      return c.json(result.error(400, 'Page ID should be a number'))
    }
    return {
      pageId: Number(value.pageId),
    }
  }),
  async (c) => {
    const { pageId } = c.req.valid('param')
    const shareLinks = await getShareLinksByPageId(c.env.DB, pageId)
    return c.json(result.success(shareLinks))
  },
)

app.delete(
  '/:id',
  validator('param', (value, c) => {
    if (!isNumberString(value.id)) {
      return c.json(result.error(400, 'ID should be a number'))
    }
    return {
      id: Number(value.id),
    }
  }),
  async (c) => {
    const { id } = c.req.valid('param')
    const success = await deleteShareLink(c.env.DB, id)

    if (!success) {
      return c.json(result.error(500, 'Failed to delete share link'))
    }

    return c.json(result.success({ id }))
  },
)

export default app

