import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import {
  mockMagicLinkConsume,
  mockMagicLinkRequest,
  seedExpiredSession,
  seedSession,
} from './helpers'
import { SEEDED_WORK_EMAIL, SESSION_STORAGE_KEY, VALID_SESSION_JWT } from './fixtures'

const readStoredToken = (page: Page) =>
  page.evaluate(key => window.sessionStorage.getItem(key), SESSION_STORAGE_KEY)

const sendLinkButton = (page: Page) => page.getByRole('button', { name: /send sign-in link/i })

test.describe('Magic-link authentication', () => {
  test('fe-auth-01 · unauthenticated visit to a protected route lands on /login', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveURL('/login')
    await expect(sendLinkButton(page)).toBeVisible()
    await expect(page.getByTestId('home-title')).toHaveCount(0)
  })

  test('fe-auth-02 · an expired stored token is treated as logged out', async ({ page }) => {
    await seedExpiredSession(page)

    await page.goto('/')

    await expect(page).toHaveURL('/login')
    await expect(page.getByTestId('home-title')).toHaveCount(0)
  })

  test('fe-auth-03 · requesting a link shows the enumeration-safe confirmation', async ({ page }) => {
    await mockMagicLinkRequest(page)
    await page.goto('/login')

    await page.getByLabel('Work email').fill(SEEDED_WORK_EMAIL)
    await sendLinkButton(page).click()

    await expect(page.getByTestId('login-confirmation')).toBeVisible()
    await expect(page.getByText(/if that address matches an account/i)).toBeVisible()
    // The email form (and any token) is gone from the UI.
    await expect(page.getByLabel('Work email')).toHaveCount(0)
  })

  test('fe-auth-03 · a failed link request shows a generic error and re-enables the form', async ({ page }) => {
    await mockMagicLinkRequest(page, { fail: true })
    await page.goto('/login')

    await page.getByLabel('Work email').fill(SEEDED_WORK_EMAIL)
    await sendLinkButton(page).click()

    await expect(page.getByRole('alert')).toContainText(/something went wrong/i)
    await expect(sendLinkButton(page)).toBeEnabled()
    await expect(page.getByTestId('login-confirmation')).toHaveCount(0)
  })

  test('fe-auth-03 · an invalid email is blocked client-side with no request sent', async ({ page }) => {
    const request = await mockMagicLinkRequest(page)
    await page.goto('/login')

    await page.getByLabel('Work email').fill('not-an-email')
    await sendLinkButton(page).click()

    await expect(page.getByText(/enter a valid email address/i)).toBeVisible()
    expect(request.wasRequested()).toBe(false)
  })

  test('fe-auth-04 · consuming a valid token establishes a session, lands on Home, and consumes once', async ({
    page,
  }) => {
    const consume = await mockMagicLinkConsume(page, 'success')

    await page.goto('/auth/magic-link/consume?token=a-valid-looking-token')

    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('home-title')).toBeVisible()

    expect(await readStoredToken(page)).toBe(VALID_SESSION_JWT)
    expect(consume.callCount()).toBe(1)
  })

  test('fe-auth-04 · consuming an invalid token shows one generic error and stores no session', async ({
    page,
  }) => {
    await mockMagicLinkConsume(page, 'unauthorized')

    await page.goto('/auth/magic-link/consume?token=expired-or-bad')

    await expect(page.getByTestId('consume-error')).toBeVisible()
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /back to sign in/i })).toBeVisible()
    // The single-use token is stripped from the address bar.
    await expect(page).toHaveURL('/auth/magic-link/consume')

    expect(await readStoredToken(page)).toBeNull()
  })

  test('fe-auth-04 · visiting the consume route with no token shows the generic error', async ({ page }) => {
    await page.goto('/auth/magic-link/consume')

    await expect(page.getByTestId('consume-error')).toBeVisible()
  })

  test('fe-auth-02 · a stored, unexpired session survives a reload', async ({ page }) => {
    await seedSession(page)

    await page.goto('/')
    await expect(page.getByTestId('home-title')).toBeVisible()

    await page.reload()
    await expect(page.getByTestId('home-title')).toBeVisible()
    await expect(page).toHaveURL('/')
  })

  test('fe-auth-02 · an authenticated user visiting /login is redirected to Home', async ({ page }) => {
    await seedSession(page)

    await page.goto('/login')

    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('home-title')).toBeVisible()
  })

  test('fe-auth-05 · signing out clears the session and returns to /login', async ({ page }) => {
    await seedSession(page)
    await page.goto('/')
    await expect(page.getByTestId('home-title')).toBeVisible()

    await page.getByTestId('account-menu-trigger').click()
    await page.getByTestId('sign-out').click()

    await expect(page).toHaveURL('/login')
    expect(await readStoredToken(page)).toBeNull()
  })
})
