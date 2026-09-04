/**
 * Network mock setup for the departure-workflow flow. All `page.route()` logic
 * lives here — specs compose these helpers.
 */

import type { Page, Route } from '@playwright/test'
import {
  departureView,
  directoryPage,
  MANAGER_USER_ID,
  managerCard,
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
  abort?: boolean
}

type Responder = MockResponse | (() => MockResponse | Promise<MockResponse>)

interface RecordedRequest {
  method: string
  url: string
  postData: string | null
  headers: Record<string, string>
}

interface MockDepartureOptions {
  /** `GET /users/:subjectId` — the header card. Default `403` (S1 unreadable). */
  subjectCard?: Responder
  /** `POST /users/:id/departures`. Default `201` + a `scheduled` view. */
  record?: Responder
  /** `GET /users/:id/departures/:departureId`. Default `200` + a `scheduled` view. */
  status?: Responder
  /** `POST /users/:id/departures/:departureId/retry`. Default `202`. */
  retry?: Responder
  /** `POST /users/:id/departure-reparenting`. Default `200`, `remainingExternalBlockers: 0`. */
  reparent?: Responder
  /** `GET /users` (the people picker). Default `200` + the directory fixture. */
  directory?: Responder
}

const LIST_RE = /\/users(?:\?.*)?$/
const CARD_RE = /\/users\/[^/?]+(?:\?.*)?$/
const REPARENT_RE = /\/users\/[^/]+\/departure-reparenting$/
const RECORD_RE = /\/users\/[^/]+\/departures$/
const STATUS_RE = /\/users\/[^/]+\/departures\/[^/]+$/
const RETRY_RE = /\/users\/[^/]+\/departures\/[^/]+\/retry$/

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

export const mockDeparture = async (page: Page, options: MockDepartureOptions = {}) => {
  const recordRequests: RecordedRequest[] = []
  const statusRequests: RecordedRequest[] = []
  const retryRequests: RecordedRequest[] = []
  const reparentRequests: RecordedRequest[] = []

  const record = (route: Route, into: RecordedRequest[]) => {
    into.push({
      method: route.request().method(),
      url: route.request().url(),
      postData: route.request().postData(),
      headers: route.request().headers(),
    })
  }

  await page.route(LIST_RE, async route => {
    if (route.request().method() !== 'GET') {
      return route.fallback()
    }
    return send(route, options.directory, 200, directoryPage())
  })

  await page.route(CARD_RE, async route => {
    if (route.request().method() !== 'GET') {
      return route.fallback()
    }
    // The blocker panel resolves the default re-parent target's name via
    // `GET /users/:managerId` — always readable in these tests.
    if (route.request().url().includes(MANAGER_USER_ID)) {
      return route.fulfill(json(200, managerCard()))
    }
    return send(route, options.subjectCard, options.subjectCard ? 200 : 403, {
      statusCode: 403,
      message: 'Forbidden',
    })
  })

  await page.route(REPARENT_RE, async route => {
    if (route.request().method() !== 'POST') {
      return route.fallback()
    }
    record(route, reparentRequests)
    return send(route, options.reparent, 200, {
      reassigned: { directReports: 2, departmentManager: false, peoplePartnerAssignments: 1 },
      remainingExternalBlockers: 0,
    })
  })

  await page.route(RECORD_RE, async route => {
    if (route.request().method() !== 'POST') {
      return route.fallback()
    }
    record(route, recordRequests)
    return send(route, options.record, 201, departureView())
  })

  await page.route(STATUS_RE, async route => {
    if (route.request().method() !== 'GET') {
      return route.fallback()
    }
    record(route, statusRequests)
    return send(route, options.status, 200, departureView())
  })

  await page.route(RETRY_RE, async route => {
    if (route.request().method() !== 'POST') {
      return route.fallback()
    }
    record(route, retryRequests)
    return send(route, options.retry, 202, {})
  })

  const lastBody = (list: RecordedRequest[]) =>
    JSON.parse(list[list.length - 1]?.postData ?? '{}') as Record<string, unknown>

  const idempotencyKeyOf = (req: RecordedRequest | undefined) =>
    req?.headers['idempotency-key'] ?? null

  return {
    recordRequests: () => recordRequests,
    statusRequests: () => statusRequests,
    retryRequests: () => retryRequests,
    reparentRequests: () => reparentRequests,
    lastRecordBody: () => lastBody(recordRequests),
    lastReparentBody: () => lastBody(reparentRequests),
    recordKeys: () => recordRequests.map(idempotencyKeyOf),
  }
}
