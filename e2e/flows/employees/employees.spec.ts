import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { mockEmployeeDirectory, readStoredToken, seedSession } from './helpers'
import { ACTIVE_PAGE_1, DISMISSED_PAGE_1, EMPTY_PAGE, multiPage, POLAND_PAGE_1 } from './fixtures'

const rowFor = (page: Page, name: RegExp) =>
  page.getByRole('row').filter({ has: page.getByRole('link', { name }) })

test.describe('Employee directory', () => {
  test('default load renders the roster, cells, footer count and a clean request', async ({
    page,
  }) => {
    const directory = await mockEmployeeDirectory(page, {
      resolve: () => ({ body: ACTIVE_PAGE_1 }),
    })
    await seedSession(page)

    await page.goto('/employees')

    const ameliaLink = page.getByRole('link', { name: /Amelia Rho/ })
    await expect(ameliaLink).toBeVisible()
    // The name cell links to the (G3) detail route for that exact row id.
    await expect(ameliaLink).toHaveAttribute('href', '/employees/emp-1')

    // Rendered cells: birthday as `D MMM`, join date localised, nullables as `—`.
    await expect(rowFor(page, /Amelia Rho/).getByText('12 Aug')).toBeVisible()
    await expect(rowFor(page, /Amelia Rho/).getByText(/2021/)).toBeVisible()
    await expect(rowFor(page, /Bohdan Serik/).getByText('—')).toHaveCount(3)

    await expect(page.getByTestId('employees-footer-count')).toHaveText(/3 employees · sorted by/i)

    // The bare list request carries only pagination — no stray filter keys.
    expect([...directory.lastRequest().keys()].sort()).toEqual(['page', 'pageSize'])
    expect(directory.lastRequest().get('pageSize')).toBe('25')
  })

  test('the sidebar "All Employees" link opens the directory', async ({ page }) => {
    await mockEmployeeDirectory(page, { resolve: () => ({ body: ACTIVE_PAGE_1 }) })
    await seedSession(page)

    await page.goto('/')
    await page.getByRole('link', { name: 'All Employees' }).click()

    await expect(page).toHaveURL('/employees')
    await expect(page.getByTestId('employees-title')).toBeVisible()
  })

  test('applying a filter reflects it in the URL, refetches, and resets the page', async ({
    page,
  }) => {
    const directory = await mockEmployeeDirectory(page, {
      resolve: params => ({
        body: params.get('country') === 'Poland' ? POLAND_PAGE_1 : ACTIVE_PAGE_1,
      }),
    })
    await seedSession(page)
    await page.goto('/employees?page=2')

    await page.getByLabel('Country', { exact: true }).fill('Poland')
    await page.getByRole('button', { name: /apply filters/i }).click()

    await expect(page).toHaveURL(/country=Poland/)
    await expect(page).not.toHaveURL(/page=2/)
    // The filtered response (Poland → Amelia only) has rendered once Bohdan is gone.
    await expect(page.getByRole('link', { name: /Amelia Rho/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Bohdan Serik/ })).toHaveCount(0)

    const request = directory.lastRequest()
    expect(request.get('country')).toBe('Poland')
    expect(request.get('page')).toBe('1')
  })

  test('forwards a valid birth-month filter but drops an out-of-range one', async ({ page }) => {
    const directory = await mockEmployeeDirectory(page, {
      resolve: params => ({ body: params.has('birthMonth') ? POLAND_PAGE_1 : ACTIVE_PAGE_1 }),
    })
    await seedSession(page)
    await page.goto('/employees')

    await page.getByLabel('Birth month', { exact: true }).fill('8')
    await page.getByRole('button', { name: /apply filters/i }).click()
    // Filtered response rendered → the request that produced it carried birthMonth.
    await expect(page.getByRole('link', { name: /Bohdan Serik/ })).toHaveCount(0)
    expect(directory.requests().some(params => params.get('birthMonth') === '8')).toBe(true)

    await page.getByLabel('Birth month', { exact: true }).fill('13')
    await page.getByRole('button', { name: /apply filters/i }).click()
    // 13 is out of range: it lands in the URL but is never sent on the wire, and
    // the unfiltered view comes back.
    await expect(page).toHaveURL(/birthMonth=13/)
    await expect(page.getByRole('link', { name: /Bohdan Serik/ })).toBeVisible()
    expect(directory.requests().every(params => params.get('birthMonth') !== '13')).toBe(true)
  })

  test('paginates through the results and disables the pager at the bounds', async ({ page }) => {
    await mockEmployeeDirectory(page, {
      resolve: params => ({ body: multiPage(Number(params.get('page') ?? '1')) }),
    })
    await seedSession(page)
    await page.goto('/employees')

    await expect(page.getByTestId('employees-pager-position')).toHaveText('Page 1 of 3')
    await expect(page.getByRole('button', { name: /previous/i })).toBeDisabled()

    await page.getByRole('button', { name: /next/i }).click()

    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByTestId('employees-pager-position')).toHaveText('Page 2 of 3')
    await expect(page.getByRole('button', { name: /previous/i })).toBeEnabled()

    await page.getByRole('button', { name: /next/i }).click()

    await expect(page.getByTestId('employees-pager-position')).toHaveText('Page 3 of 3')
    await expect(page.getByRole('button', { name: /next/i })).toBeDisabled()
  })

  test('filtering by dismissed status shows dismissed rows with a badge', async ({ page }) => {
    const directory = await mockEmployeeDirectory(page, {
      resolve: params => ({
        body: params.get('employmentStatus') === 'dismissed' ? DISMISSED_PAGE_1 : ACTIVE_PAGE_1,
      }),
    })
    await seedSession(page)
    await page.goto('/employees')

    await page.getByLabel('Employment status').click()
    await page.getByRole('option', { name: 'Dismissed' }).click()
    await page.getByRole('button', { name: /apply filters/i }).click()

    await expect(page).toHaveURL(/employmentStatus=dismissed/)

    await expect(rowFor(page, /Hassan Karim/).getByText('Dismissed')).toBeVisible()
    expect(directory.lastRequest().get('employmentStatus')).toBe('dismissed')
  })

  test('an empty result renders the empty state with a clear-filters action', async ({ page }) => {
    await mockEmployeeDirectory(page, {
      resolve: params => ({ body: params.get('position') ? EMPTY_PAGE : ACTIVE_PAGE_1 }),
    })
    await seedSession(page)
    await page.goto('/employees')

    await page.getByLabel('Position', { exact: true }).fill('Nonexistent')
    await page.getByRole('button', { name: /apply filters/i }).click()

    const emptyPanel = page.getByTestId('employees-empty')
    await expect(emptyPanel).toBeVisible()
    await expect(emptyPanel.getByRole('button', { name: /clear filters/i })).toBeEnabled()

    await emptyPanel.getByRole('button', { name: /clear filters/i }).click()
    await expect(page).toHaveURL(/\/employees$/)
    await expect(page.getByRole('link', { name: /Amelia Rho/ })).toBeVisible()
  })

  test('a 400 keeps the filter bar and shows the bad-request panel without a retry', async ({
    page,
  }) => {
    await mockEmployeeDirectory(page, {
      resolve: () => ({ status: 400, body: { statusCode: 400, message: 'Bad Request' } }),
    })
    await seedSession(page)
    await page.goto('/employees')

    await expect(page.getByTestId('employees-badrequest')).toBeVisible()
    // The filter bar stays mounted so the offending value can be fixed.
    await expect(page.getByLabel('Country', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /try again/i })).toHaveCount(0)
    await expect(
      page.getByTestId('employees-badrequest').getByRole('button', { name: /clear filters/i })
    ).toBeVisible()
  })

  test('a 403 renders the no-access panel with no retry loop', async ({ page }) => {
    const directory = await mockEmployeeDirectory(page, {
      resolve: () => ({ status: 403, body: { statusCode: 403, message: 'Forbidden' } }),
    })
    await seedSession(page)
    await page.goto('/employees')

    await expect(page.getByTestId('employees-forbidden')).toBeVisible()
    await expect(page.getByRole('table')).toHaveCount(0)
    // A terminal 403 is hit exactly once — no retry storm.
    await page.waitForLoadState('networkidle')
    expect(directory.callCount()).toBe(1)
  })

  test('a 500 renders the error panel and the retry button refetches', async ({ page }) => {
    let attempt = 0
    const directory = await mockEmployeeDirectory(page, {
      resolve: () => {
        attempt += 1
        return attempt <= 2
          ? { status: 500, body: { message: 'boom' } }
          : { status: 200, body: ACTIVE_PAGE_1 }
      },
    })
    await seedSession(page)
    await page.goto('/employees')

    await expect(page.getByTestId('employees-error')).toBeVisible()
    const callsBeforeRetry = directory.callCount()

    await page.getByRole('button', { name: /try again/i }).click()

    await expect(page.getByRole('link', { name: /Amelia Rho/ })).toBeVisible()
    expect(directory.callCount()).toBeGreaterThan(callsBeforeRetry)
  })

  test('a 401 on the list request triggers the global redirect to /login', async ({ page }) => {
    await mockEmployeeDirectory(page, {
      resolve: () => ({ status: 401, body: { statusCode: 401, message: 'Unauthorized' } }),
    })
    await seedSession(page)

    await page.goto('/employees')

    await expect(page).toHaveURL('/login')
    expect(await readStoredToken(page)).toBeNull()
  })
})
