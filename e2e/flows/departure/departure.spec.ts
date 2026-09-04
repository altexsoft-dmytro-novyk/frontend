import { test, expect, type Page } from '@playwright/test'
import { mockDeparture, readStoredToken, seedSession } from './helpers'
import {
  blockedBody,
  departureView,
  DEPARTURE_ID,
  EXPECTED_BLOCKER_VERSION,
  FUTURE_DATE,
  MANAGER_USER_ID,
  OTHER_TARGET_USER_ID,
  reparentResult,
  SUBJECT_USER_ID,
} from './fixtures'

const DEPARTURE_URL = `/employees/${SUBJECT_USER_ID}/departure`

const open = async (page: Page, suffix = '') => {
  await seedSession(page)
  await page.goto(`${DEPARTURE_URL}${suffix}`)
}

const fillForm = async (page: Page, { date = FUTURE_DATE, reason = 'Relocating abroad' } = {}) => {
  await page.getByLabel('Effective date').fill(date)
  await page.getByLabel('Reason').fill(reason)
}

/** Recording a departure is now a two-step gesture: submit opens a confirm
 * dialog, and the record `POST` fires only on the dialog's confirm. */
const submitAndConfirm = async (page: Page) => {
  await page.getByTestId('departure-submit').click()
  await page.getByTestId('departure-confirm-submit').click()
}

test.describe('Departure workflow', () => {
  test('records a clean departure: Idempotency-Key header + body, 201 → status view + ?departure=', async ({
    page,
  }) => {
    const probe = await mockDeparture(page)
    await open(page)

    await fillForm(page)
    await submitAndConfirm(page)

    await expect(page.getByTestId('departure-status')).toBeVisible()
    await expect(page.getByTestId('departure-status-badge')).toHaveText('Scheduled')
    await expect(page).toHaveURL(new RegExp(`\\?departure=${DEPARTURE_ID}$`))

    expect(probe.lastRecordBody()).toEqual({
      effectiveDate: FUTURE_DATE,
      reason: 'Relocating abroad',
    })
    expect(probe.recordKeys()[0]).toBeTruthy()
  })

  test('a past effective date is blocked client-side — no request is sent', async ({ page }) => {
    const probe = await mockDeparture(page)
    await open(page)

    await fillForm(page, { date: '2020-01-01' })
    await page.getByTestId('departure-submit').click()

    await expect(page.getByTestId('departure-form')).toContainText(/must be in the future/i)
    expect(probe.recordRequests()).toHaveLength(0)
  })

  test('a 409 blocked-by-responsibilities response renders the blocker panel with names', async ({
    page,
  }) => {
    await mockDeparture(page, { record: { status: 409, body: blockedBody() } })
    await open(page)

    await fillForm(page)
    await submitAndConfirm(page)

    const panel = page.getByTestId('departure-blockers')
    await expect(panel).toBeVisible()
    await expect(panel).toContainText('Ada Lovelace')
    await expect(panel).toContainText('Grace Hopper')
    await expect(panel).toContainText('Alan Turing')
    await expect(page.getByTestId('departure-reparent-default')).toContainText('Nadia Okoro')
  })

  test('re-parent to the default clears blockers and "record now" resubmits with a NEW key', async ({
    page,
  }) => {
    let recordCalls = 0
    const probe = await mockDeparture(page, {
      record: () => {
        recordCalls += 1
        return recordCalls === 1
          ? { status: 409, body: blockedBody() }
          : { status: 201, body: departureView() }
      },
      reparent: { status: 200, body: reparentResult(0) },
    })
    await open(page)

    await fillForm(page)
    await submitAndConfirm(page)
    await page.getByTestId('departure-reparent-default').click()

    await expect(page.getByTestId('departure-blockers-cleared')).toBeVisible()
    expect(probe.lastReparentBody()).toEqual({
      targetId: MANAGER_USER_ID,
      expectedBlockerVersion: EXPECTED_BLOCKER_VERSION,
    })

    await page.getByTestId('departure-record-now').click()
    await expect(page.getByTestId('departure-status')).toBeVisible()

    const keys = probe.recordKeys()
    expect(keys).toHaveLength(2)
    expect(keys[0]).toBeTruthy()
    expect(keys[1]).toBeTruthy()
    expect(keys[1]).not.toEqual(keys[0])
  })

  test('re-parenting that leaves external blockers shows the timetracker message and does not resubmit', async ({
    page,
  }) => {
    const probe = await mockDeparture(page, {
      record: { status: 409, body: blockedBody() },
      reparent: { status: 200, body: reparentResult(2) },
    })
    await open(page)

    await fillForm(page)
    await submitAndConfirm(page)
    await page.getByTestId('departure-reparent-default').click()

    await expect(page.getByTestId('departure-blockers-external')).toContainText(/2 external/i)
    await expect(page.getByTestId('departure-blockers-external')).toContainText(/timetracker/i)
    expect(probe.recordRequests()).toHaveLength(1)
  })

  test('a stale blocker version reloads the blockers (a fresh record POST) and shows a note', async ({
    page,
  }) => {
    let recordCalls = 0
    const probe = await mockDeparture(page, {
      record: () => {
        recordCalls += 1
        return {
          status: 409,
          body: blockedBody({
            expectedBlockerVersion: recordCalls === 1 ? 'v1:first' : 'v1:second',
          }),
        }
      },
      reparent: { status: 409, body: { error: 'blocker_version_stale' } },
    })
    await open(page)

    await fillForm(page)
    await submitAndConfirm(page)
    await page.getByTestId('departure-reparent-default').click()

    await expect(page.getByTestId('departure-blockers-error')).toContainText(/situation changed/i)
    expect(probe.recordRequests()).toHaveLength(2)
  })

  test('a 409 departure_already_scheduled shows the "already has a scheduled departure" copy', async ({
    page,
  }) => {
    await mockDeparture(page, {
      record: { status: 409, body: { error: 'departure_already_scheduled' } },
    })
    await open(page)

    await fillForm(page)
    await submitAndConfirm(page)

    await expect(page.getByTestId('departure-form-error')).toContainText(
      /already has a scheduled departure/i
    )
  })

  test('a retry_wait status shows attempts + last error and "Retry now" calls the retry route', async ({
    page,
  }) => {
    const probe = await mockDeparture(page, {
      status: {
        body: departureView({
          state: 'retry_wait',
          attempts: 2,
          lastError: 'see operational logs',
        }),
      },
    })
    await open(page, `?departure=${DEPARTURE_ID}`)

    await expect(page.getByTestId('departure-status-badge')).toHaveText('Retry pending')
    await expect(page.getByTestId('departure-status')).toContainText('Attempts')
    await expect(page.getByTestId('departure-status')).toContainText('see operational logs')

    await page.getByTestId('departure-retry-now').click()
    await expect.poll(() => probe.retryRequests().length).toBe(1)
  })

  test('an applied status renders the terminal panel with no retry action', async ({ page }) => {
    await mockDeparture(page, {
      status: {
        body: departureView({
          state: 'applied',
          attempts: 1,
          lastError: null,
          appliedAt: `${FUTURE_DATE}T00:05:00.000Z`,
        }),
      },
    })
    await open(page, `?departure=${DEPARTURE_ID}`)

    await expect(page.getByTestId('departure-status-badge')).toHaveText('Applied')
    await expect(page.getByTestId('departure-status-applied-note')).toBeVisible()
    await expect(page.getByTestId('departure-retry-now')).toHaveCount(0)
  })

  test('a write 403 collapses the form to a permission notice', async ({ page }) => {
    await mockDeparture(page, { record: { status: 403, body: { statusCode: 403 } } })
    await open(page)

    await fillForm(page)
    await submitAndConfirm(page)

    await expect(page.getByTestId('departure-permission-notice')).toBeVisible()
    await expect(page.getByTestId('departure-submit')).toBeDisabled()
  })

  test('an unknown ?departure= id shows "no longer available" with a path back to the form', async ({
    page,
  }) => {
    await mockDeparture(page, { status: { status: 404, body: { statusCode: 404 } } })
    await open(page, '?departure=does-not-exist')

    await expect(page.getByTestId('departure-status-gone')).toContainText(/no longer available/i)

    await page.getByRole('button', { name: /back to the record form/i }).click()
    await expect(page.getByTestId('departure-form')).toBeVisible()
    await expect(page).toHaveURL(DEPARTURE_URL)
  })

  test('the confirm dialog Cancel sends no request', async ({ page }) => {
    const probe = await mockDeparture(page)
    await open(page)

    await fillForm(page)
    await page.getByTestId('departure-submit').click()
    await expect(page.getByTestId('departure-confirm')).toBeVisible()
    await page.getByRole('button', { name: /^cancel$/i }).click()

    await expect(page.getByTestId('departure-confirm')).toHaveCount(0)
    expect(probe.recordRequests()).toHaveLength(0)
  })

  test('a 409 idempotency_key_payload_mismatch shows the reload copy', async ({ page }) => {
    await mockDeparture(page, {
      record: { status: 409, body: { error: 'idempotency_key_payload_mismatch' } },
    })
    await open(page)

    await fillForm(page)
    await submitAndConfirm(page)

    await expect(page.getByTestId('departure-form-error')).toContainText(/reload the page/i)
  })

  test('the blocker panel "choose someone else" path re-parents to a picked target', async ({
    page,
  }) => {
    const probe = await mockDeparture(page, {
      record: { status: 409, body: blockedBody({ defaultReparentTargetId: undefined }) },
      reparent: { status: 200, body: reparentResult(0) },
    })
    await open(page)

    await fillForm(page)
    await submitAndConfirm(page)

    await expect(page.getByTestId('departure-reparent-default')).toHaveCount(0)
    await page.getByTestId('departure-reparent-choose').click()
    await page
      .getByTestId('person-picker')
      .getByRole('button', { name: /Piotr Zielinski/ })
      .click()

    await expect(page.getByTestId('departure-blockers-cleared')).toBeVisible()
    expect(probe.lastReparentBody()).toEqual({
      targetId: OTHER_TARGET_USER_ID,
      expectedBlockerVersion: EXPECTED_BLOCKER_VERSION,
    })
  })

  test('a re-parent 404 shows the unknown-target copy', async ({ page }) => {
    await mockDeparture(page, {
      record: { status: 409, body: blockedBody() },
      reparent: { status: 404, body: { statusCode: 404 } },
    })
    await open(page)

    await fillForm(page)
    await submitAndConfirm(page)
    await page.getByTestId('departure-reparent-default').click()

    await expect(page.getByTestId('departure-blockers-error')).toContainText(/couldn't be found/i)
  })

  test('a status GET 403 shows the forbidden panel', async ({ page }) => {
    await mockDeparture(page, { status: { status: 403, body: { statusCode: 403 } } })
    await open(page, `?departure=${DEPARTURE_ID}`)

    await expect(page.getByTestId('departure-status-forbidden')).toContainText(/can't view/i)
  })

  test('retry returning departure_not_retryable shows the note and refetches', async ({ page }) => {
    const probe = await mockDeparture(page, {
      status: { body: departureView({ state: 'retry_wait', attempts: 1, lastError: 'x' }) },
      retry: { status: 409, body: { error: 'departure_not_retryable' } },
    })
    await open(page, `?departure=${DEPARTURE_ID}`)

    await page.getByTestId('departure-retry-now').click()

    await expect(page.getByTestId('departure-status-note')).toContainText(/no longer be retried/i)
    await expect.poll(() => probe.statusRequests().length).toBeGreaterThan(1)
  })

  test('an unchanged resubmit reuses the idempotency key; a changed value mints a new one', async ({
    page,
  }) => {
    const probe = await mockDeparture(page, {
      record: { status: 409, body: { error: 'departure_already_scheduled' } },
    })
    await open(page)

    await fillForm(page)
    await submitAndConfirm(page)
    await expect(page.getByTestId('departure-form-error')).toBeVisible()
    await submitAndConfirm(page)
    await expect.poll(() => probe.recordRequests().length).toBe(2)

    await page.getByLabel('Reason').fill('A corrected reason')
    await submitAndConfirm(page)
    await expect.poll(() => probe.recordRequests().length).toBe(3)

    const keys = probe.recordKeys()
    expect(keys[0]).toEqual(keys[1])
    expect(keys[2]).not.toEqual(keys[1])
  })

  test('a 401 anywhere triggers the global redirect to /login', async ({ page }) => {
    await mockDeparture(page, { record: { status: 401, body: { statusCode: 401 } } })
    await open(page)

    await fillForm(page)
    await submitAndConfirm(page)

    await expect(page).toHaveURL('/login')
    expect(await readStoredToken(page)).toBeNull()
  })

  test('the profile screen links through to the Departure screen', async ({ page }) => {
    await page.route(/\/users\/[^/]+\/events(?:\?.*)?$/, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], canEdit: false }),
      })
    )
    await mockDeparture(page, {
      subjectCard: {
        body: {
          data: {
            id: SUBJECT_USER_ID,
            firstName: 'Sam',
            lastName: 'Rivera',
            photo: null,
            position: 'Software Engineer',
            country: 'Spain',
            city: 'Madrid',
            workEmail: 'sam.rivera@example.com',
            workPhone: null,
            birthDay: 1,
            birthMonth: 6,
            companyJoinDate: '2022-01-10',
          },
          canEdit: false,
        },
      },
    })
    await seedSession(page)
    await page.goto(`/employees/${SUBJECT_USER_ID}`)

    await page.getByTestId('profile-departure-link').click()
    await expect(page).toHaveURL(DEPARTURE_URL)
    await expect(page.getByTestId('departure-form')).toBeVisible()
  })
})
