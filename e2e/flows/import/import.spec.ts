import { test, expect, type Page } from '@playwright/test'
import { mockImport, readStoredToken, seedSession } from './helpers'
import { cleanSummary, HEADER_MISMATCH_400, partialSummary, populatedDirectory } from './fixtures'

const CSV_BYTES = Buffer.from('Email;First name;Last name\nada@example.com;Ada;Lovelace\n')

const pickFile = (page: Page, name = 'population.csv') =>
  page.getByLabel('Population file').setInputFiles({
    name,
    mimeType: 'text/csv',
    buffer: CSV_BYTES,
  })

const openImport = async (page: Page) => {
  await seedSession(page)
  await page.goto('/employees/import')
}

/** Submit now opens a confirm dialog; the POST fires only on confirm. */
const submitAndConfirm = async (page: Page) => {
  await page.getByTestId('import-submit').click()
  await page.getByTestId('import-confirm-submit').click()
}

test.describe('Population import', () => {
  test('fe-imp-01 · a picked CSV is POSTed as multipart with a single "file" part and the 200 summary renders', async ({
    page,
  }) => {
    const probe = await mockImport(page, { importResponse: { body: cleanSummary() } })
    await openImport(page)

    await pickFile(page)
    await expect(page.getByTestId('import-selected-file')).toContainText('population.csv')
    await submitAndConfirm(page)

    await expect(page.getByTestId('import-result')).toBeVisible()
    await expect(page.getByTestId('import-count-created')).toContainText('512')
    await expect(page.getByTestId('import-count-departmentsCreated')).toContainText('8')
    await expect(page.getByTestId('import-count-skipped')).toContainText('0')
    await expect(page.getByTestId('import-errors')).toHaveCount(0)

    const sent = probe.lastImport()
    expect(sent.method).toBe('POST')
    expect(sent.contentType).toMatch(/^multipart\/form-data; boundary=/)
    expect(sent.postData).toContain('filename="population.csv"')
    // The body carries exactly one form-data part, and it is `file`.
    const partNames = [
      ...(sent.postData ?? '').matchAll(/Content-Disposition: form-data; name="([^"]+)"/g),
    ].map(match => match[1])
    expect(partNames).toEqual(['file'])
  })

  test('fe-imp-02 · a 200 with skipped rows shows the errors table (with a copy action) and is not an error panel', async ({
    page,
  }) => {
    await mockImport(page, { importResponse: { body: partialSummary() } })
    await openImport(page)

    await pickFile(page)
    await submitAndConfirm(page)

    await expect(page.getByTestId('import-result')).toBeVisible()
    await expect(page.getByTestId('import-result')).toContainText('some rows skipped')
    await expect(page.getByTestId('import-error')).toHaveCount(0)
    await expect(page.getByTestId('import-count-skipped')).toContainText('3')

    const errors = page.getByTestId('import-errors')
    await expect(errors).toBeVisible()
    await expect(errors).toContainText('first name is required')
    await expect(errors).toContainText('email is required')
    await expect(errors).toContainText('14')
    await expect(page.getByTestId('import-copy-skipped')).toBeVisible()
  })

  test('fe-imp-01 · a clean 200 shows the "everything imported" copy', async ({ page }) => {
    await mockImport(page, { importResponse: { body: cleanSummary() } })
    await openImport(page)

    await pickFile(page)
    await submitAndConfirm(page)

    await expect(page.getByTestId('import-result')).toContainText('Import complete')
    await expect(page.getByTestId('import-result')).toContainText('Every row was imported')
    await expect(page.getByTestId('import-errors')).toHaveCount(0)
    await expect(page.getByTestId('import-copy-skipped')).toHaveCount(0)
  })

  test('fe-imp-05 · a 400 shows the backend message verbatim, no summary, and the picker stays usable', async ({
    page,
  }) => {
    await mockImport(page, {
      importResponse: { status: 400, body: HEADER_MISMATCH_400 },
    })
    await openImport(page)

    await pickFile(page)
    await submitAndConfirm(page)

    await expect(page.getByTestId('import-file-error')).toContainText(
      'the file header does not match the expected timetracker export columns'
    )
    await expect(page.getByTestId('import-result')).toHaveCount(0)
    await expect(page.getByTestId('import-submit')).toBeEnabled()
    await expect(page.getByLabel('Population file')).toBeEnabled()
  })

  test('fe-imp-05 · the fix-and-re-upload loop: picking a corrected file clears the 400 and resubmits to a 200', async ({
    page,
  }) => {
    let calls = 0
    await mockImport(page, {
      importResponse: () => {
        calls += 1
        return calls === 1 ? { status: 400, body: HEADER_MISMATCH_400 } : { body: cleanSummary() }
      },
    })
    await openImport(page)

    await pickFile(page, 'wrong-export.csv')
    await submitAndConfirm(page)
    await expect(page.getByTestId('import-file-error')).toBeVisible()

    await pickFile(page, 'corrected-export.csv')
    await expect(page.getByTestId('import-file-error')).toHaveCount(0)
    await expect(page.getByTestId('import-submit')).toBeEnabled()

    await submitAndConfirm(page)
    await expect(page.getByTestId('import-result')).toBeVisible()
  })

  test('fe-imp-03 · picking a second, different file replaces the shown selection', async ({ page }) => {
    await mockImport(page)
    await openImport(page)

    await pickFile(page, 'first.csv')
    await expect(page.getByTestId('import-selected-file')).toContainText('first.csv')

    await pickFile(page, 'second.csv')
    await expect(page.getByTestId('import-selected-file')).toContainText('second.csv')
    await expect(page.getByTestId('import-selected-file')).not.toContainText('first.csv')
  })

  test('fe-imp-03 · a non-.csv name shows the soft hint but still allows submitting', async ({ page }) => {
    await mockImport(page)
    await openImport(page)

    await pickFile(page, 'population.txt')
    await expect(page.getByTestId('import-csv-hint')).toBeVisible()
    await expect(page.getByTestId('import-submit')).toBeEnabled()
  })

  test('fe-imp-03 · an empty file is blocked before any request', async ({ page }) => {
    const probe = await mockImport(page)
    await openImport(page)

    await page.getByLabel('Population file').setInputFiles({
      name: 'empty.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(''),
    })

    await expect(page.getByTestId('import-empty-file-hint')).toBeVisible()
    await expect(page.getByTestId('import-submit')).toBeDisabled()
    expect(probe.importCount()).toBe(0)
  })

  test('fe-imp-04 · the confirm dialog: Cancel sends nothing, Confirm proceeds', async ({ page }) => {
    const probe = await mockImport(page, { importResponse: { body: cleanSummary() } })
    await openImport(page)

    await pickFile(page)
    await page.getByTestId('import-submit').click()
    await expect(page.getByTestId('import-confirm')).toBeVisible()

    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByTestId('import-confirm')).toHaveCount(0)
    expect(probe.importCount()).toBe(0)

    await page.getByTestId('import-submit').click()
    await page.getByTestId('import-confirm-submit').click()
    await expect(page.getByTestId('import-result')).toBeVisible()
    expect(probe.importCount()).toBe(1)
  })

  test('fe-imp-06 · a 403 shows the permission notice and disables the upload control', async ({ page }) => {
    await mockImport(page, {
      importResponse: { status: 403, body: { statusCode: 403, message: 'Forbidden' } },
    })
    await openImport(page)

    await pickFile(page)
    await submitAndConfirm(page)

    await expect(page.getByTestId('import-permission-notice')).toBeVisible()
    await expect(page.getByTestId('import-submit')).toBeDisabled()
    await expect(page.getByLabel('Population file')).toBeDisabled()
    await expect(page.getByTestId('import-result')).toHaveCount(0)
  })

  test('fe-imp-05 · a 500 shows the generic server error and re-enables the picker', async ({ page }) => {
    await mockImport(page, {
      importResponse: { status: 500, body: { message: 'boom' } },
    })
    await openImport(page)

    await pickFile(page)
    await submitAndConfirm(page)

    await expect(page.getByTestId('import-error')).toContainText("didn't complete")
    await expect(page.getByTestId('import-result')).toHaveCount(0)
    await expect(page.getByTestId('import-submit')).toBeEnabled()
  })

  test('fe-imp-05 · a 200 with a malformed body is treated as a server error, not a result', async ({
    page,
  }) => {
    await mockImport(page, {
      importResponse: { status: 200, body: { ok: true } },
    })
    await openImport(page)

    await pickFile(page)
    await submitAndConfirm(page)

    await expect(page.getByTestId('import-error')).toBeVisible()
    await expect(page.getByTestId('import-result')).toHaveCount(0)
  })

  test('fe-imp-07 · a 401 triggers the global redirect to /login', async ({ page }) => {
    await mockImport(page, {
      importResponse: { status: 401, body: { statusCode: 401 } },
    })
    await openImport(page)

    await pickFile(page)
    await submitAndConfirm(page)

    await expect(page).toHaveURL('/login')
    expect(await readStoredToken(page)).toBeNull()
  })

  test('fe-imp-08 · the directory empty state (no filters) leads with the Import population CTA', async ({
    page,
  }) => {
    await mockImport(page)
    await seedSession(page)
    await page.goto('/employees')

    const panel = page.getByTestId('employees-empty-unfiltered')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('No employees yet')
    // The unfiltered empty state offers only the import CTA — no clear-filters.
    await expect(panel.getByRole('button', { name: /clear filters/i })).toHaveCount(0)

    await panel.getByRole('link', { name: 'Import population' }).click()
    await expect(page).toHaveURL('/employees/import')
    await expect(page.getByTestId('import-title')).toBeVisible()
  })

  test('fe-imp-08 · the directory toolbar Import population button routes to the import screen', async ({
    page,
  }) => {
    await mockImport(page)
    await seedSession(page)
    await page.goto('/employees')

    await page.getByTestId('employees-import-link').click()
    await expect(page).toHaveURL('/employees/import')
  })

  test('fe-imp-08 · the directory 403 panel hides the toolbar Import population button', async ({ page }) => {
    await mockImport(page, {
      directory: { status: 403, body: { statusCode: 403, message: 'Forbidden' } },
    })
    await seedSession(page)
    await page.goto('/employees')

    await expect(page.getByTestId('employees-forbidden')).toBeVisible()
    await expect(page.getByTestId('employees-import-link')).toHaveCount(0)
  })

  test('fe-imp-09 · a successful import invalidates the directory query so the next visit refetches', async ({
    page,
  }) => {
    let imported = false
    await mockImport(page, {
      importResponse: () => {
        imported = true
        return { body: cleanSummary() }
      },
      directory: () => ({
        body: imported
          ? populatedDirectory()
          : { items: [], page: 1, pageSize: 25, total: 0, totalPages: 0 },
      }),
    })
    await seedSession(page)

    // First directory visit: empty. Reach import via the in-app toolbar link so
    // the query cache survives the navigation.
    await page.goto('/employees')
    await expect(page.getByTestId('employees-empty-unfiltered')).toBeVisible()

    await page.getByTestId('employees-import-link').click()
    await pickFile(page)
    await submitAndConfirm(page)
    await expect(page.getByTestId('import-result')).toBeVisible()

    // Back to the directory in-app: the invalidated query refetches and the
    // freshly-imported person appears (a stale 5-min cache would still be empty).
    await page.getByTestId('import-view-directory').click()
    await expect(page).toHaveURL('/employees')
    await expect(page.getByRole('link', { name: /Amelia Rho/ })).toBeVisible()
  })
})
