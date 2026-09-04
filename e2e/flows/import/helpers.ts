/**
 * Network mock setup for the population-import flow. All `page.route()` logic
 * lives here — specs compose these helpers, never inline route handlers.
 */

import type { Page, Route } from '@playwright/test'
import { cleanSummary, emptyDirectory, SEEDED_SESSION_JWT, SESSION_STORAGE_KEY } from './fixtures'

export const seedSession = async (page: Page) => {
  await page.goto('/login')
  await page.evaluate(([key, value]) => window.sessionStorage.setItem(key, value), [
    SESSION_STORAGE_KEY,
    SEEDED_SESSION_JWT,
  ] as const)
}

export const readStoredToken = (page: Page) =>
  page.evaluate(key => window.sessionStorage.getItem(key), SESSION_STORAGE_KEY)

const json = (status: number, body: unknown) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
})

interface MockResponse {
  status?: number
  body?: unknown
  abort?: boolean
}

type Responder = MockResponse | (() => MockResponse | Promise<MockResponse>)

interface RecordedImport {
  method: string
  contentType: string
  postData: string | null
}

interface MockImportOptions {
  /** `POST /users/import`. Default `200` + a clean summary. */
  importResponse?: Responder
  /** `GET /users` (the directory). Default `200` + an empty directory. */
  directory?: Responder
}

const LIST_RE = /\/users(?:\?.*)?$/
const IMPORT_RE = /\/users\/import$/

const send = async (
  route: Route,
  responder: Responder | undefined,
  defaultStatus: number,
  defaultBody: unknown
) => {
  const r = typeof responder === 'function' ? await responder() : (responder ?? {})
  if (r.abort) {
    return route.abort('failed')
  }
  return route.fulfill(json(r.status ?? defaultStatus, r.body ?? defaultBody))
}

export const mockImport = async (page: Page, options: MockImportOptions = {}) => {
  const imports: RecordedImport[] = []
  const listRequests: URLSearchParams[] = []

  // `IMPORT_RE` and `LIST_RE` are disjoint: `LIST_RE` ends in `/users$` (with an
  // optional query string) so it never matches `/users/import`. The import route
  // is registered first only for readability.
  await page.route(IMPORT_RE, async route => {
    if (route.request().method() !== 'POST') {
      return route.fallback()
    }
    imports.push({
      method: route.request().method(),
      contentType: route.request().headers()['content-type'] ?? '',
      postData: route.request().postData(),
    })
    return send(route, options.importResponse, 200, cleanSummary())
  })

  await page.route(LIST_RE, async route => {
    if (route.request().method() !== 'GET') {
      return route.fallback()
    }
    listRequests.push(new URL(route.request().url()).searchParams)
    return send(route, options.directory, 200, emptyDirectory())
  })

  return {
    imports: () => imports,
    lastImport: () => imports[imports.length - 1],
    importCount: () => imports.length,
    listCount: () => listRequests.length,
  }
}
