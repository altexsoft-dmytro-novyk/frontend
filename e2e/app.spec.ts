import { test, expect } from '@playwright/test'

test.describe('App', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')

    // App container renders without errors
    await expect(page.getByTestId('app-container')).toBeVisible()

    // Home page renders inside the main layout
    await expect(page.getByTestId('home-title')).toBeVisible()
  })

  test('should redirect unknown routes to home', async ({ page }) => {
    await page.goto('/some-unknown-route')

    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('home-title')).toBeVisible()
  })
})
