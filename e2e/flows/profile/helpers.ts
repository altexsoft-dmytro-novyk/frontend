/**
 * Network mock setup for the employee-profile flow. All `page.route()` logic
 * lives here — specs compose these helpers, never inline route handlers.
 */

import type { Page, Route } from '@playwright/test'
import { SEEDED_SESSION_JWT, SESSION_STORAGE_KEY } from './fixtures'

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
}

interface RecordedRequest {
  method: string
  url: string
  contentType: string
  postData: string | null
}

interface MockProfileOptions {
  /** `GET /users/:id`. Default 200 + `{}`. A function is re-evaluated per call. */
  card?: MockResponse | (() => MockResponse)
  /** `PATCH /users/:id`. Default 200 + `{}`. */
  patch?: (body: Record<string, unknown>) => MockResponse
  /** `PUT /users/:id/photo`. Default 200 + `{}`. */
  photo?: MockResponse
  /** `GET /users/:id/events`. Default 200 + `{}`. A function is re-evaluated per call. */
  events?: MockResponse | (() => MockResponse)
  /** `POST /users/:id/events`. Default 201 + `{}`. */
  createEvent?: (body: Record<string, unknown>) => MockResponse
  /** `DELETE /users/:id/events/:eventId`. Default 204. A function gets the id. */
  deleteEvent?: MockResponse | ((eventId: string) => MockResponse)
}

const CARD_RE = /\/users\/[^/?]+(?:\?.*)?$/
const EVENTS_RE = /\/users\/[^/]+\/events(?:\?.*)?$/
const EVENT_ITEM_RE = /\/users\/[^/]+\/events\/[^/?]+(?:\?.*)?$/
const PHOTO_RE = /\/users\/[^/]+\/photo(?:\?.*)?$/

const parseBody = (route: Route): Record<string, unknown> => {
  try {
    return JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>
  } catch {
    return {}
  }
}

/**
 * Intercept every `/users/:id*` endpoint the profile screen touches. Returns a
 * probe exposing the recorded requests (in call order) per endpoint family.
 */
export const mockProfile = async (page: Page, options: MockProfileOptions = {}) => {
  const cardRequests: RecordedRequest[] = []
  const patchRequests: RecordedRequest[] = []
  const photoRequests: RecordedRequest[] = []
  const eventsRequests: RecordedRequest[] = []
  const createEventRequests: RecordedRequest[] = []
  const deleteEventRequests: RecordedRequest[] = []

  const record = (route: Route, into: RecordedRequest[]) => {
    into.push({
      method: route.request().method(),
      url: route.request().url(),
      contentType: route.request().headers()['content-type'] ?? '',
      postData: route.request().postData(),
    })
  }

  // Register general → specific; Playwright checks the most recent match first.
  await page.route(CARD_RE, async route => {
    const method = route.request().method()
    if (method === 'GET') {
      record(route, cardRequests)
      const resolved = typeof options.card === 'function' ? options.card() : (options.card ?? {})
      return route.fulfill(json(resolved.status ?? 200, resolved.body ?? {}))
    }
    if (method === 'PATCH') {
      record(route, patchRequests)
      const result = options.patch ? options.patch(parseBody(route)) : {}
      return route.fulfill(json(result.status ?? 200, result.body ?? {}))
    }
    return route.fallback()
  })

  await page.route(PHOTO_RE, async route => {
    if (route.request().method() !== 'PUT') {
      return route.fallback()
    }
    record(route, photoRequests)
    const { status = 200, body = {} } = options.photo ?? {}
    return route.fulfill(json(status, body))
  })

  await page.route(EVENTS_RE, async route => {
    const method = route.request().method()
    if (method === 'GET') {
      record(route, eventsRequests)
      const resolved =
        typeof options.events === 'function' ? options.events() : (options.events ?? {})
      return route.fulfill(json(resolved.status ?? 200, resolved.body ?? {}))
    }
    if (method === 'POST') {
      record(route, createEventRequests)
      const result = options.createEvent ? options.createEvent(parseBody(route)) : {}
      return route.fulfill(json(result.status ?? 201, result.body ?? {}))
    }
    return route.fallback()
  })

  await page.route(EVENT_ITEM_RE, async route => {
    if (route.request().method() !== 'DELETE') {
      return route.fallback()
    }
    record(route, deleteEventRequests)
    const eventId = new URL(route.request().url()).pathname.split('/').pop() ?? ''
    const resolved =
      typeof options.deleteEvent === 'function'
        ? options.deleteEvent(eventId)
        : (options.deleteEvent ?? {})
    const status = resolved.status ?? 204
    return route.fulfill(
      status === 204 ? { status: 204, body: '' } : json(status, resolved.body ?? {})
    )
  })

  return {
    cardRequests: () => cardRequests,
    patchRequests: () => patchRequests,
    photoRequests: () => photoRequests,
    eventsRequests: () => eventsRequests,
    createEventRequests: () => createEventRequests,
    deleteEventRequests: () => deleteEventRequests,
    lastPatchBody: () => JSON.parse(patchRequests[patchRequests.length - 1]?.postData ?? '{}'),
    lastCreateBody: () =>
      JSON.parse(createEventRequests[createEventRequests.length - 1]?.postData ?? '{}'),
  }
}
