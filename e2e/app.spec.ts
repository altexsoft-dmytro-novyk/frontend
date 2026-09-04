import { test, expect } from '@playwright/test'

test.describe('App', () => {
  test('fe-shell-01 · renders the app shell and sends anonymous visitors to /login', async ({ page }) => {
    await page.goto('/')

    // App container renders without errors
    await expect(page.getByTestId('app-container')).toBeVisible()

    // No session → the protected shell redirects to the login screen
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('button', { name: /send sign-in link/i })).toBeVisible()
  })

  test('fe-shell-01 · routes unknown paths back through the guard to /login', async ({ page }) => {
    await page.goto('/some-unknown-route')

    await expect(page).toHaveURL('/login')
  })
})
