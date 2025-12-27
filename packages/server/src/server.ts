import { Hono } from 'hono'
import type { Bindings, HonoTypeUserInformation } from './constants/binding'
import tokenMiddleware from './middleware/token'
import data from './api/data'
import pages from '~/api/pages'
import auth from '~/api/auth'
import folders from '~/api/folders'
import tags from '~/api/tags'
import config from '~/api/config'
import shares from '~/api/shares'
import { getShareLinkByCode, isShareLinkExpired } from '~/model/share'
import { getPageById } from '~/model/page'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  return c.html(
    `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script type="module" src="/static/index.js"></script>
  <link rel="stylesheet" href="/static/index.css">
  <link rel="icon" href="/static/logo.svg" />
  <title>Knowledge</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
  )
})

const api = new Hono<HonoTypeUserInformation>()

api.use(tokenMiddleware)

api.route('/pages', pages)
api.route('/auth', auth)
api.route('/folders', folders)
api.route('/tags', tags)
api.route('/data', data)
api.route('/config', config)
api.route('/shares', shares)
app.route('/api', api)

// Public share page route (no authentication required)
app.get('/share/:code', async (c) => {
  const code = c.req.param('code')

  const shareLink = await getShareLinkByCode(c.env.DB, code)

  if (!shareLink) {
    return c.html(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Share Link Not Found</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f0f0f; color: #e5e5e5; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 1rem; color: #ef4444; }
    p { color: #a3a3a3; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Link Not Found</h1>
    <p>This share link does not exist or has been removed.</p>
  </div>
</body>
</html>`,
      404,
    )
  }

  if (isShareLinkExpired(shareLink)) {
    return c.html(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Share Link Expired</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f0f0f; color: #e5e5e5; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 1rem; color: #f59e0b; }
    p { color: #a3a3a3; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Link Expired</h1>
    <p>This share link has expired and is no longer accessible.</p>
  </div>
</body>
</html>`,
      410,
    )
  }

  const page = await getPageById(c.env.DB, { id: shareLink.pageId, isDeleted: false })

  if (!page) {
    return c.html(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f0f0f; color: #e5e5e5; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 1rem; color: #ef4444; }
    p { color: #a3a3a3; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Page Not Found</h1>
    <p>The shared page no longer exists.</p>
  </div>
</body>
</html>`,
      404,
    )
  }

  const content = await c.env.BUCKET.get(page.contentUrl)
  if (!content) {
    return c.html(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Not Found</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f0f0f; color: #e5e5e5; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 1rem; color: #ef4444; }
    p { color: #a3a3a3; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Content Not Found</h1>
    <p>The page content could not be retrieved.</p>
  </div>
</body>
</html>`,
      404,
    )
  }

  c.res.headers.set('cache-control', 'public, max-age=3600')
  return c.html(await content.text())
})

export default app
