import { test, expect, type Page } from '@playwright/test'
import { mockProfile, readStoredToken, seedSession } from './helpers'
import {
  cardResponse,
  eventsResponse,
  EVENTS,
  OTHER_CARD,
  OTHER_USER_ID,
  OWN_CARD,
  OWN_USER_ID,
  type S1IdentityCard,
} from './fixtures'

test.describe('Employee profile', () => {
  test('fe-prof-01 · read-only view renders the identity card, dashes for nulls and no edit affordance', async ({
    page,
  }) => {
    await mockProfile(page, {
      card: { body: cardResponse(OTHER_CARD, false) },
      events: { status: 403, body: { statusCode: 403, message: 'Forbidden' } },
    })
    await seedSession(page)
    await page.goto(`/employees/${OTHER_USER_ID}`)

    await expect(page.getByTestId('profile-name')).toHaveText('Carla Mendes')
    await expect(page.getByTestId('profile-identity-card')).toBeVisible()
    // city + workPhone are null → rendered as the em dash.
    await expect(page.getByTestId('profile-identity-card').getByText('—')).toHaveCount(2)
    await expect(page.getByTestId('profile-edit-button')).toHaveCount(0)
    // Not my profile → no photo control.
    await expect(page.getByTestId('profile-photo-input')).toHaveCount(0)
    // Colleague timeline → the "not available" state, not an error panel.
    await expect(page.getByTestId('timeline-forbidden')).toBeVisible()
    await expect(page.getByTestId('timeline-error')).toHaveCount(0)
  })

  test('fe-prof-01 · my own profile shows the photo-upload control', async ({ page }) => {
    await mockProfile(page, {
      card: { body: cardResponse(OWN_CARD, false) },
      events: { body: eventsResponse([], false) },
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await expect(page.getByTestId('profile-name')).toHaveText('Amelia Rho')
    await expect(page.getByTestId('profile-photo-input')).toBeAttached()
    await expect(page.getByRole('button', { name: /change photo/i })).toBeVisible()
    await expect(page.getByTestId('profile-edit-button')).toHaveCount(0)
  })

  test('fe-prof-02 · an editable card edits one field and PATCHes only the changed key', async ({ page }) => {
    let current: S1IdentityCard = { ...OWN_CARD }
    const probe = await mockProfile(page, {
      card: () => ({ body: cardResponse(current, true) }),
      events: { body: eventsResponse(EVENTS, false) },
      patch: body => {
        current = { ...current, ...(body as Partial<S1IdentityCard>) }
        return { body: current }
      },
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await page.getByTestId('profile-edit-button').click()
    const positionInput = page.getByLabel('Position', { exact: true })
    await expect(positionInput).toHaveValue('Senior Engineer')

    await positionInput.fill('Staff Engineer')
    await page.getByRole('button', { name: /save changes/i }).click()

    await expect(page.getByTestId('profile-edit-form')).toHaveCount(0)
    await expect(
      page.getByTestId('profile-identity-card').getByText('Staff Engineer')
    ).toBeVisible()
    expect(probe.lastPatchBody()).toEqual({ position: 'Staff Engineer' })
  })

  test('fe-prof-03 · a 409 on the email edit shows a conflict error and leaves the card unchanged', async ({
    page,
  }) => {
    await mockProfile(page, {
      card: { body: cardResponse(OWN_CARD, true) },
      events: { body: eventsResponse([], false) },
      patch: () => ({ status: 409, body: { statusCode: 409, message: 'Conflict' } }),
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await page.getByTestId('profile-edit-button').click()
    await page.getByLabel('Work email', { exact: true }).fill('taken@example.com')
    await page.getByRole('button', { name: /save changes/i }).click()

    await expect(page.getByText(/already in use/i)).toBeVisible()
    // Still in edit mode, card value not swapped.
    await expect(page.getByTestId('profile-edit-form')).toBeVisible()
  })

  test('fe-prof-05 · uploads a valid photo and rejects a bad type client-side', async ({ page }) => {
    const probe = await mockProfile(page, {
      card: { body: cardResponse(OWN_CARD, false) },
      events: { body: eventsResponse([], false) },
      photo: { body: { ...OWN_CARD, photo: 'https://cdn.example.com/p.jpg' } },
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    // A PDF is rejected before any request.
    await page.getByTestId('profile-photo-input').setInputFiles({
      name: 'cv.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4'),
    })
    await expect(page.getByTestId('profile-photo-error')).toBeVisible()
    expect(probe.photoRequests()).toHaveLength(0)

    // A small PNG uploads as multipart.
    await page.getByTestId('profile-photo-input').setInputFiles({
      name: 'me.png',
      mimeType: 'image/png',
      buffer: Buffer.from('89504e470d0a1a0a', 'hex'),
    })
    await expect.poll(() => probe.photoRequests().length).toBe(1)
    expect(probe.photoRequests()[0].contentType).toMatch(/^multipart\/form-data/)
  })

  test('fe-prof-06 · shows the empty timeline state, then adds an event and refetches', async ({ page }) => {
    let events: typeof EVENTS = []
    const probe = await mockProfile(page, {
      card: { body: cardResponse(OWN_CARD, false) },
      events: () => ({ body: eventsResponse(events, true) }),
      createEvent: body => {
        events = [
          {
            id: 'evt-new',
            type: String(body.type),
            eventDate: String(body.eventDate),
            details: body.details ?? {},
            source: 'manual',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ]
        return { status: 201, body: events[0] }
      },
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await expect(page.getByTestId('timeline-empty')).toBeVisible()

    await page.getByTestId('timeline-add-event').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Event type').fill('promotion')
    await dialog.getByLabel('Event date').fill('2025-01-01')
    await dialog.getByRole('button', { name: /^add event$/i }).click()

    await expect(page.getByTestId('timeline-list')).toContainText('promotion')
    expect(probe.lastCreateBody()).toEqual({ type: 'promotion', eventDate: '2025-01-01' })
  })

  test('fe-prof-07 · deletes an event through the confirm dialog', async ({ page }) => {
    let events = [...EVENTS]
    const probe = await mockProfile(page, {
      card: { body: cardResponse(OWN_CARD, false) },
      events: () => ({ body: eventsResponse(events, true) }),
      deleteEvent: eventId => {
        events = events.filter(event => event.id !== eventId)
        return { status: 204 }
      },
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await expect(page.getByTestId('timeline-list')).toContainText('certification')
    await page
      .getByRole('button', { name: /delete event/i })
      .last()
      .click()
    await page.getByRole('button', { name: /^delete$/i }).click()

    await expect(page.getByTestId('timeline-list')).not.toContainText('certification')
    expect(probe.deleteEventRequests().length).toBeGreaterThan(0)
  })

  test('fe-prof-07 · a failed delete keeps the row and shows an inline error', async ({ page }) => {
    await mockProfile(page, {
      card: { body: cardResponse(OWN_CARD, false) },
      events: () => ({ body: eventsResponse([...EVENTS], true) }),
      deleteEvent: () => ({ status: 403, body: { statusCode: 403, message: 'Forbidden' } }),
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await expect(page.getByTestId('timeline-list')).toContainText('certification')
    await page
      .getByRole('button', { name: /delete event/i })
      .last()
      .click()
    await page.getByRole('button', { name: /^delete$/i }).click()

    await expect(page.getByText(/already gone, or your access changed/i)).toBeVisible()
    await expect(page.getByTestId('timeline-list')).toContainText('certification')
  })

  test('fe-prof-08 · a 404 on the card renders the unavailable panel with a link back to the directory', async ({
    page,
  }) => {
    await mockProfile(page, {
      card: { status: 404, body: { statusCode: 404, message: 'Not Found' } },
    })
    await seedSession(page)
    await page.goto(`/employees/${OTHER_USER_ID}`)

    await expect(page.getByTestId('profile-unavailable')).toBeVisible()
    const backLink = page
      .getByTestId('profile-unavailable')
      .getByRole('link', { name: /back to all employees/i })
    await expect(backLink).toHaveAttribute('href', '/employees')
  })

  test('fe-prof-08 · a 500 on the card renders the error panel and retry refetches', async ({ page }) => {
    let attempt = 0
    await mockProfile(page, {
      card: () => {
        attempt += 1
        return attempt <= 2
          ? { status: 500, body: { message: 'boom' } }
          : { body: cardResponse(OWN_CARD, false) }
      },
      events: { body: eventsResponse([], false) },
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await expect(page.getByTestId('profile-error')).toBeVisible()
    await page.getByRole('button', { name: /try again/i }).click()
    await expect(page.getByTestId('profile-name')).toHaveText('Amelia Rho')
  })

  test('fe-prof-08 · a 403 on the card also renders the unavailable panel', async ({ page }) => {
    const probe = await mockProfile(page, {
      card: { status: 403, body: { statusCode: 403, message: 'Forbidden' } },
    })
    await seedSession(page)
    await page.goto(`/employees/${OTHER_USER_ID}`)

    await expect(page.getByTestId('profile-unavailable')).toBeVisible()
    await page.waitForLoadState('networkidle')
    // Terminal 403 — hit once, no retry storm.
    expect(probe.cardRequests()).toHaveLength(1)
  })

  test('fe-prof-10 · the "My profile" account-menu item resolves to /employees/<my user id>', async ({
    page,
  }) => {
    await mockProfile(page, {
      card: { body: cardResponse(OWN_CARD, false) },
      events: { body: eventsResponse([], false) },
    })
    await seedSession(page)
    await page.goto('/')

    await page.getByTestId('account-menu-trigger').click()
    await page.getByTestId('my-profile').click()

    await expect(page).toHaveURL(`/employees/${OWN_USER_ID}`)
    await expect(page.getByTestId('profile-name')).toHaveText('Amelia Rho')
  })

  test('fe-prof-11 · a 401 anywhere on the profile triggers the global redirect to /login', async ({ page }) => {
    await mockProfile(page, {
      card: { status: 401, body: { statusCode: 401, message: 'Unauthorized' } },
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await expect(page).toHaveURL('/login')
    expect(await readStoredToken(page)).toBeNull()
  })

  test('fe-prof-09 · a timeline 403 is requested exactly once — no retry', async ({ page }) => {
    const probe = await mockProfile(page, {
      card: { body: cardResponse(OTHER_CARD, false) },
      events: { status: 403, body: { statusCode: 403, message: 'Forbidden' } },
    })
    await seedSession(page)
    await page.goto(`/employees/${OTHER_USER_ID}`)

    await expect(page.getByTestId('timeline-forbidden')).toBeVisible()
    await page.waitForLoadState('networkidle')
    expect(probe.eventsRequests()).toHaveLength(1)
  })

  test('fe-prof-08 · a 200 with no data body renders the error panel, never a blank screen', async ({
    page,
  }) => {
    await mockProfile(page, {
      card: { body: {} },
      events: { body: eventsResponse([], false) },
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await expect(page.getByTestId('profile-error')).toBeVisible()
    await expect(page.getByTestId('profile-name')).toHaveCount(0)
  })

  test.describe('identity-card validation blocks the request', () => {
    const openEdit = async (page: Page) => {
      await seedSession(page)
      await page.goto(`/employees/${OWN_USER_ID}`)
      await page.getByTestId('profile-edit-button').click()
    }

    test('fe-prof-04 · a malformed email shows a field error and sends no PATCH', async ({ page }) => {
      const probe = await mockProfile(page, {
        card: { body: cardResponse(OWN_CARD, true) },
        events: { body: eventsResponse([], false) },
      })
      await openEdit(page)

      await page.getByLabel('Work email', { exact: true }).fill('not-an-email')
      await page.getByRole('button', { name: /save changes/i }).click()

      await expect(page.getByText(/valid email address/i)).toBeVisible()
      expect(probe.patchRequests()).toHaveLength(0)
    })

    test('fe-prof-04 · birth month 13 shows a range error and sends no PATCH', async ({ page }) => {
      const probe = await mockProfile(page, {
        card: { body: cardResponse(OWN_CARD, true) },
        events: { body: eventsResponse([], false) },
      })
      await openEdit(page)

      await page.getByLabel('Birth month', { exact: true }).fill('13')
      await page.getByRole('button', { name: /save changes/i }).click()

      await expect(page.getByText(/between 1 and 12/i)).toBeVisible()
      expect(probe.patchRequests()).toHaveLength(0)
    })

    test('fe-prof-04 · clearing only the birth month shows the pair error and sends no PATCH', async ({
      page,
    }) => {
      const probe = await mockProfile(page, {
        card: { body: cardResponse(OWN_CARD, true) },
        events: { body: eventsResponse([], false) },
      })
      await openEdit(page)

      await page.getByLabel('Birth month', { exact: true }).fill('')
      await page.getByRole('button', { name: /save changes/i }).click()

      await expect(page.getByText(/both the birth day and month/i)).toBeVisible()
      expect(probe.patchRequests()).toHaveLength(0)
    })

    test('fe-prof-04 · clearing both birthday halves is blocked with an inline message', async ({ page }) => {
      const probe = await mockProfile(page, {
        card: { body: cardResponse(OWN_CARD, true) },
        events: { body: eventsResponse([], false) },
      })
      await openEdit(page)

      await page.getByLabel('Birth day', { exact: true }).fill('')
      await page.getByLabel('Birth month', { exact: true }).fill('')
      await page.getByRole('button', { name: /save changes/i }).click()

      await expect(page.getByText(/can't be cleared here/i)).toBeVisible()
      expect(probe.patchRequests()).toHaveLength(0)
      await expect(page.getByTestId('profile-edit-form')).toBeVisible()
    })
  })

  test('fe-prof-02 · editing the birth day PATCHes a numeric value', async ({ page }) => {
    const probe = await mockProfile(page, {
      card: { body: cardResponse(OWN_CARD, true) },
      events: { body: eventsResponse([], false) },
      patch: body => ({ body: { ...OWN_CARD, ...body } }),
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await page.getByTestId('profile-edit-button').click()
    await page.getByLabel('Birth day', { exact: true }).fill('15')
    await page.getByRole('button', { name: /save changes/i }).click()

    await expect(page.getByTestId('profile-edit-form')).toHaveCount(0)
    const body = probe.lastPatchBody()
    expect(body).toEqual({ birthDay: 15 })
    expect(typeof body.birthDay).toBe('number')
  })

  test('fe-prof-05 · a 6 MiB photo is rejected client-side with no request', async ({ page }) => {
    const probe = await mockProfile(page, {
      card: { body: cardResponse(OWN_CARD, false) },
      events: { body: eventsResponse([], false) },
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await page.getByTestId('profile-photo-input').setInputFiles({
      name: 'huge.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(6 * 1024 * 1024, 1),
    })

    await expect(page.getByTestId('profile-photo-error')).toContainText(/larger than 5 MB/i)
    expect(probe.photoRequests()).toHaveLength(0)
  })

  test('fe-prof-05 · a 503 on the photo upload shows the storage-specific message', async ({ page }) => {
    await mockProfile(page, {
      card: { body: cardResponse(OWN_CARD, false) },
      events: { body: eventsResponse([], false) },
      photo: { status: 503, body: { statusCode: 503, message: 'Service Unavailable' } },
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await page.getByTestId('profile-photo-input').setInputFiles({
      name: 'me.png',
      mimeType: 'image/png',
      buffer: Buffer.from('89504e470d0a1a0a', 'hex'),
    })

    await expect(page.getByTestId('profile-photo-error')).toContainText(/storage is temporarily/i)
  })

  test('fe-prof-06 · invalid JSON in the add-event details blocks the POST', async ({ page }) => {
    const probe = await mockProfile(page, {
      card: { body: cardResponse(OWN_CARD, false) },
      events: () => ({ body: eventsResponse([], true) }),
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await page.getByTestId('timeline-add-event').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Event type').fill('promotion')
    await dialog.getByLabel('Event date').fill('2025-01-01')
    await dialog.getByLabel(/details/i).fill('{ not json')
    await dialog.getByRole('button', { name: /^add event$/i }).click()

    await expect(dialog.getByText(/must be valid JSON/i)).toBeVisible()
    expect(probe.createEventRequests()).toHaveLength(0)
  })

  test('fe-prof-06 · valid details JSON is carried in the add-event POST body', async ({ page }) => {
    let events: typeof EVENTS = []
    const probe = await mockProfile(page, {
      card: { body: cardResponse(OWN_CARD, false) },
      events: () => ({ body: eventsResponse(events, true) }),
      createEvent: body => {
        events = [
          {
            id: 'evt-new',
            type: String(body.type),
            eventDate: String(body.eventDate),
            details: body.details ?? {},
            source: 'manual',
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ]
        return { status: 201, body: events[0] }
      },
    })
    await seedSession(page)
    await page.goto(`/employees/${OWN_USER_ID}`)

    await page.getByTestId('timeline-add-event').click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Event type').fill('promotion')
    await dialog.getByLabel('Event date').fill('2025-01-01')
    await dialog.getByLabel(/details/i).fill('{"from":"A","to":"B"}')
    await dialog.getByRole('button', { name: /^add event$/i }).click()

    await expect(page.getByTestId('timeline-list')).toContainText('promotion')
    expect(probe.lastCreateBody()).toEqual({
      type: 'promotion',
      eventDate: '2025-01-01',
      details: { from: 'A', to: 'B' },
    })
  })
})
