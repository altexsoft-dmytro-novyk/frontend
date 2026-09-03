/**
 * Network mock setup for the organisational-relationships flow. All
 * `page.route()` logic lives here — specs compose these helpers.
 */

import type { Page, Route } from '@playwright/test'
import {
  directoryPage,
  journalResponse,
  JOURNAL_ROWS,
  SEEDED_SESSION_JWT,
  SESSION_STORAGE_KEY,
} from './fixtures'

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
  /** Simulate a transport failure (no response reaches the client). */
  abort?: boolean
}

/** A fixed response, or one computed (optionally async) from the request body. */
type Responder =
  | MockResponse
  | ((body: Record<string, unknown>) => MockResponse | Promise<MockResponse>)

interface RecordedRequest {
  method: string
  url: string
  postData: string | null
}

interface MockOrganisationOptions {
  /** `GET /users/:id` — the S1 identity card for the screen header. Default
   * `403` (the common case: most viewers can't read S1), so the header falls
   * back to the raw id. */
  subjectCard?: Responder
  /** `GET /users/:id/access-journal`. Default 200 + all journal rows. */
  journal?: Responder
  /** `POST /users/:id/relationships`. Default 201 + `{}`. */
  assignManager?: Responder
  /** `PUT /users/:id/relationships/people-partner`. Default 200 + `{}`. */
  changePeoplePartner?: Responder
  /** `DELETE /users/:id/relationships/people-partner`. Default 200. */
  removePeoplePartner?: Responder
  /** `GET /users` (the people picker). Default 200 + the directory fixture. */
  directory?: Responder
}

const LIST_RE = /\/users(?:\?.*)?$/
const CARD_RE = /\/users\/[^/?]+(?:\?.*)?$/
const JOURNAL_RE = /\/users\/[^/]+\/access-journal(?:\?.*)?$/
const PP_RE = /\/users\/[^/]+\/relationships\/people-partner(?:\?.*)?$/
const RELATIONSHIPS_RE = /\/users\/[^/]+\/relationships(?:\?.*)?$/

const parseBody = (route: Route): Record<string, unknown> => {
  try {
    return JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>
  } catch {
    return {}
  }
}

/** Resolve, fulfil (or abort) a route from a `Responder`. */
const send = async (
  route: Route,
  responder: Responder | undefined,
  defaultStatus: number,
  defaultBody: unknown
) => {
  const r = typeof responder === 'function' ? await responder(parseBody(route)) : (responder ?? {})
  if (r.abort) {
    return route.abort('failed')
  }
  return route.fulfill(json(r.status ?? defaultStatus, r.body ?? defaultBody))
}

export const mockOrganisation = async (page: Page, options: MockOrganisationOptions = {}) => {
  const journalRequests: RecordedRequest[] = []
  const assignManagerRequests: RecordedRequest[] = []
  const changePpRequests: RecordedRequest[] = []
  const removePpRequests: RecordedRequest[] = []
  const directoryRequests: RecordedRequest[] = []

  const record = (route: Route, into: RecordedRequest[]) => {
    into.push({
      method: route.request().method(),
      url: route.request().url(),
      postData: route.request().postData(),
    })
  }

  await page.route(LIST_RE, async route => {
    if (route.request().method() !== 'GET') {
      return route.fallback()
    }
    record(route, directoryRequests)
    return send(route, options.directory, 200, directoryPage())
  })

  await page.route(CARD_RE, async route => {
    if (route.request().method() !== 'GET') {
      return route.fallback()
    }
    // No `subjectCard` override → default `403` (the common S1-unreadable case).
    // An override without its own status is a readable card → default `200`.
    return send(route, options.subjectCard, options.subjectCard ? 200 : 403, {
      statusCode: 403,
      message: 'Forbidden',
    })
  })

  await page.route(JOURNAL_RE, async route => {
    if (route.request().method() !== 'GET') {
      return route.fallback()
    }
    record(route, journalRequests)
    return send(route, options.journal, 200, journalResponse(JOURNAL_ROWS))
  })

  await page.route(RELATIONSHIPS_RE, async route => {
    if (route.request().method() !== 'POST') {
      return route.fallback()
    }
    record(route, assignManagerRequests)
    return send(route, options.assignManager, 201, {})
  })

  await page.route(PP_RE, async route => {
    const method = route.request().method()
    if (method === 'PUT') {
      record(route, changePpRequests)
      return send(route, options.changePeoplePartner, 200, {})
    }
    if (method === 'DELETE') {
      record(route, removePpRequests)
      return send(route, options.removePeoplePartner, 200, {})
    }
    return route.fallback()
  })

  return {
    journalRequests: () => journalRequests,
    assignManagerRequests: () => assignManagerRequests,
    changePpRequests: () => changePpRequests,
    removePpRequests: () => removePpRequests,
    directoryRequests: () => directoryRequests,
    lastAssignManagerBody: () =>
      JSON.parse(assignManagerRequests[assignManagerRequests.length - 1]?.postData ?? '{}'),
    lastChangePpBody: () =>
      JSON.parse(changePpRequests[changePpRequests.length - 1]?.postData ?? '{}'),
  }
}
