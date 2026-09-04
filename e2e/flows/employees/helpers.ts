/**
 * Network mock setup for the employee-directory flow. All `page.route()` logic
 * lives here — specs compose these helpers, never inline route handlers.
 */

import type { Page } from '@playwright/test'
import { SEEDED_SESSION_JWT, SESSION_STORAGE_KEY } from './fixtures'

/**
 * Put a valid, unexpired session token in `sessionStorage` for the test origin,
 * simulating a browser that already completed the magic-link flow.
 */
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

interface DirectoryResponse {
  status?: number
  body?: unknown
}

interface MockDirectoryOptions {
  /** Map the request's query params to a response. Defaults to a 200 + `{}`. */
  resolve?: (params: URLSearchParams) => DirectoryResponse
}

// The list endpoint only: bare `/users`, optionally with a query string —
// never `/users/<id>` or any deeper path.
const LIST_ENDPOINT = /\/users(?:\?.*)?$/

/**
 * Intercept the `GET /users` list endpoint. Returns a probe exposing every
 * intercepted request's parsed query params, in call order.
 */
export const mockEmployeeDirectory = async (page: Page, options: MockDirectoryOptions = {}) => {
  const requests: URLSearchParams[] = []
  const resolve = options.resolve ?? (() => ({ status: 200, body: {} }))

  await page.route(LIST_ENDPOINT, async route => {
    if (route.request().method() !== 'GET') {
      return route.fallback()
    }
    const params = new URL(route.request().url()).searchParams
    requests.push(params)
    const { status = 200, body = {} } = resolve(params)
    await route.fulfill(json(status, body))
  })

  return {
    requests: () => requests,
    lastRequest: () => requests[requests.length - 1],
    callCount: () => requests.length,
  }
}
