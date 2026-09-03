/**
 * Network mock setup for the magic-link auth flow. All `page.route()` logic
 * lives here — specs compose these, never inline route handlers.
 */

import type { Page } from '@playwright/test'
import {
  EXPIRED_SESSION_JWT,
  SESSION_STORAGE_KEY,
  VALID_ESTABLISHED_SESSION,
  VALID_SESSION_JWT,
} from './fixtures'

const seedToken = async (page: Page, token: string) => {
  await page.goto('/login')
  await page.evaluate(([key, value]) => window.sessionStorage.setItem(key, value), [
    SESSION_STORAGE_KEY,
    token,
  ] as const)
}

/**
 * Put a valid, unexpired session token in `sessionStorage` for the test origin,
 * simulating a browser that already completed the magic-link flow.
 */
export const seedSession = (page: Page) => seedToken(page, VALID_SESSION_JWT)

/** Put an expired (but well-formed) session token in `sessionStorage`. */
export const seedExpiredSession = (page: Page) => seedToken(page, EXPIRED_SESSION_JWT)

const json = (status: number, body: unknown) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
})

/**
 * POST /auth/magic-link — always enumeration-safe `{ sent: true }` unless `fail`.
 * Returns a probe so a spec can assert whether the request was ever sent
 * (e.g. client-side validation should block it).
 */
export const mockMagicLinkRequest = async (page: Page, { fail = false } = {}) => {
  let calls = 0
  await page.route('**/auth/magic-link', async route => {
    if (route.request().method() !== 'POST') {
      return route.fallback()
    }
    calls += 1
    await route.fulfill(fail ? json(500, { message: 'boom' }) : json(200, { sent: true }))
  })
  return { wasRequested: () => calls > 0 }
}

type ConsumeOutcome = 'success' | 'unauthorized'

/**
 * POST /auth/magic-link/consume — 200 + session on `success`, bare 401 otherwise.
 * Returns a probe of how many times the endpoint was hit (guards the
 * consume-exactly-once behaviour under React StrictMode).
 */
export const mockMagicLinkConsume = async (page: Page, outcome: ConsumeOutcome = 'success') => {
  let calls = 0
  await page.route('**/auth/magic-link/consume', async route => {
    if (route.request().method() !== 'POST') {
      return route.fallback()
    }
    calls += 1
    await route.fulfill(
      outcome === 'success'
        ? json(200, VALID_ESTABLISHED_SESSION)
        : json(401, { statusCode: 401, message: 'Unauthorized' })
    )
  })
  return { callCount: () => calls, wasConsumedOnce: () => calls === 1 }
}
