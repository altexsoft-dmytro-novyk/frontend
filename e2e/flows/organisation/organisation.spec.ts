import { test, expect, type Page } from '@playwright/test'
import { mockOrganisation, readStoredToken, seedSession } from './helpers'
import {
  journalResponse,
  JOURNAL_ROWS,
  managerEdge,
  MANAGER_ONLY_ROWS,
  OTHER_TARGET_USER_ID,
  relationshipsResponse,
  SEEDED_PP_TARGET_ID,
  SUBJECT_USER_ID,
  TARGET_USER_ID,
  type AccessJournalRow,
} from './fixtures'

const ORG_URL = `/employees/${SUBJECT_USER_ID}/organisation`

const open = async (page: Page) => {
  await seedSession(page)
  await page.goto(ORG_URL)
}

const pickInDialog = (page: Page, name: RegExp) =>
  page.getByRole('dialog').getByRole('button', { name }).click()

const managerRow = (targetId: string): AccessJournalRow => ({
  id: 'evt-mgr',
  occurredAt: '2026-02-15T09:00:00.000Z',
  actorUserId: 'actor',
  subjectUserId: SUBJECT_USER_ID,
  kind: 'manager',
  before: null,
  after: {
    relationshipId: 'rel',
    userId: SUBJECT_USER_ID,
    type: 'direct',
    reportsToUserId: targetId,
  },
})

test.describe('Organisational relationships', () => {
  test('fe-org-01 · renders the journal newest-first with formatted cells and shows the authoritative current manager / PP by name', async ({
    page,
  }) => {
    await mockOrganisation(page)
    await open(page)

    const rows = page.getByTestId('organisation-journal-table').locator('tbody tr')
    await expect(rows).toHaveCount(3)
    await expect(rows.first()).toContainText('People Partner')

    // The `manager` row: "When" is a locale date (not the raw ISO), "Before" is
    // the em dash, "After" carries the edge target.
    const mgrRow = rows.filter({ hasText: 'Manager' }).first()
    await expect(mgrRow).toContainText('2026')
    await expect(mgrRow).not.toContainText('T09:00:00')
    const cells = mgrRow.locator('td')
    await expect(cells.nth(3)).toHaveText('—')
    await expect(cells.nth(4)).toContainText('dddddddd-dddd-4ddd-8ddd-dddddddddddd')

    // The section values now come from the authoritative relationships read.
    await expect(page.getByTestId('organisation-manager-derived-current')).toHaveText('Dana Mercer')
    await expect(page.getByTestId('organisation-pp-derived-current')).toHaveText('Cora Pratt')
    await expect(page.getByTestId('organisation-reassign-manager')).toBeVisible()
    await expect(page.getByTestId('organisation-remove-manager')).toBeVisible()
  })

  test('fe-org-01 · shows the loading state for the current value while the relationships read is in flight', async ({
    page,
  }) => {
    await mockOrganisation(page, {
      relationships: async () => {
        await new Promise(resolve => setTimeout(resolve, 500))
        return {}
      },
    })
    await open(page)

    await expect(page.getByTestId('organisation-manager-derived-loading')).toBeVisible()
    await expect(page.getByTestId('organisation-manager-derived-current')).toBeVisible()
  })

  test('fe-org-02 · the subject header shows the person name when the S1 card is readable', async ({
    page,
  }) => {
    await mockOrganisation(page, {
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
    await open(page)

    await expect(page.getByTestId('organisation-subject-name')).toHaveText('Sam Rivera')
  })

  test('fe-org-03 · a journal 403 shows the explanatory panel once and the sections fall back to "not available"', async ({
    page,
  }) => {
    const probe = await mockOrganisation(page, {
      journal: { status: 403, body: { statusCode: 403, message: 'Forbidden' } },
      relationships: { status: 403, body: { statusCode: 403, message: 'Forbidden' } },
    })
    await open(page)

    await expect(page.getByTestId('organisation-journal-forbidden')).toContainText(
      /visible only to this person's current manager or People Partner/i
    )
    await expect(page.getByTestId('organisation-manager-derived-unknown')).toBeVisible()
    await expect(page.getByTestId('organisation-pp-derived-unknown')).toBeVisible()
    await expect(page.getByTestId('organisation-assign-manager')).toBeVisible()
    await expect(page.getByTestId('organisation-reassign-manager')).toHaveCount(0)

    await page.waitForLoadState('networkidle')
    expect(probe.journalRequests()).toHaveLength(1)
    expect(probe.relationshipsRequests()).toHaveLength(1)
  })

  test('fe-org-03 · a journal 404 shows a non-retryable "not found" panel', async ({ page }) => {
    const probe = await mockOrganisation(page, {
      journal: { status: 404, body: { statusCode: 404, message: 'Not Found' } },
      relationships: { status: 404, body: { statusCode: 404, message: 'Not Found' } },
    })
    await open(page)

    await expect(page.getByTestId('organisation-not-found')).toBeVisible()
    await expect(page.getByTestId('organisation-manager')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /try again/i })).toHaveCount(0)
    await page.waitForLoadState('networkidle')
    expect(probe.journalRequests()).toHaveLength(1)
  })

  test('fe-org-03 · a malformed journal body (200, no data array) renders the error panel, not the empty state', async ({
    page,
  }) => {
    await mockOrganisation(page, { journal: { body: { unexpected: true } } })
    await open(page)

    await expect(page.getByTestId('organisation-journal-error')).toBeVisible()
    await expect(page.getByTestId('organisation-journal-empty')).toHaveCount(0)
  })

  test('fe-org-03 · an empty journal (200, data: []) plus an empty relationships read shows the empty state and "none assigned" hints', async ({
    page,
  }) => {
    await mockOrganisation(page, {
      journal: { body: journalResponse([]) },
      relationships: { body: relationshipsResponse([]) },
    })
    await open(page)

    await expect(page.getByTestId('organisation-journal-empty')).toBeVisible()
    await expect(page.getByTestId('organisation-manager-derived-none')).toBeVisible()
    await expect(page.getByTestId('organisation-pp-derived-none')).toBeVisible()
  })

  test('fe-org-03 · a journal 500 renders the error panel and retry refetches', async ({ page }) => {
    let attempt = 0
    await mockOrganisation(page, {
      journal: () => {
        attempt += 1
        return attempt <= 2 ? { status: 500, body: { message: 'boom' } } : {}
      },
    })
    await open(page)

    await expect(page.getByTestId('organisation-journal-error')).toBeVisible()
    await page.getByRole('button', { name: /try again/i }).click()
    await expect(page.getByTestId('organisation-journal-table')).toBeVisible()
  })

  test('fe-org-04 · assigns a manager: POST body is exactly { type, targetId } and the journal refetches', async ({
    page,
  }) => {
    let rows = [...JOURNAL_ROWS]
    const probe = await mockOrganisation(page, {
      journal: () => ({ body: journalResponse(rows) }),
      relationships: { body: relationshipsResponse([]) },
      assignManager: () => {
        rows = [managerRow(TARGET_USER_ID), ...rows]
        return { status: 201, body: { id: 'rel-new' } }
      },
    })
    await open(page)

    await page.getByTestId('organisation-assign-manager').click()
    await pickInDialog(page, /Nadia Okoro/)

    await expect(page.getByTestId('organisation-manager')).toContainText(/just assigned/i)
    expect(probe.lastAssignManagerBody()).toEqual({ type: 'direct', targetId: TARGET_USER_ID })
    await expect.poll(() => probe.journalRequests().length).toBeGreaterThan(1)
  })

  test('fe-org-04 · the reassign picker excludes the subject and the current manager', async ({ page }) => {
    await mockOrganisation(page, {
      relationships: {
        body: relationshipsResponse([
          managerEdge({
            target: { id: OTHER_TARGET_USER_ID, firstName: 'Piotr', lastName: 'Zieliński' },
          }),
        ]),
      },
    })
    await open(page)

    await page.getByTestId('organisation-reassign-manager').click()
    const list = page.getByTestId('person-picker-list')
    await expect(list.getByRole('button', { name: /Nadia Okoro/ })).toBeVisible()
    await expect(list.getByRole('button', { name: /Sam Rivera/ })).toHaveCount(0)
    await expect(list.getByRole('button', { name: /Piotr/ })).toHaveCount(0)
  })

  test('fe-org-05 · a plain 409 on manager assignment shows the "already has a manager" copy', async ({
    page,
  }) => {
    await mockOrganisation(page, {
      relationships: { body: relationshipsResponse([]) },
      assignManager: () => ({ status: 409, body: { statusCode: 409, message: 'Conflict' } }),
    })
    await open(page)

    await page.getByTestId('organisation-assign-manager').click()
    await pickInDialog(page, /Nadia Okoro/)

    await expect(page.getByTestId('organisation-manager-error')).toContainText(
      /already has a manager/i
    )
  })

  test('fe-org-05 · a 409 target_has_scheduled_departure on manager assignment shows its own copy', async ({
    page,
  }) => {
    await mockOrganisation(page, {
      relationships: { body: relationshipsResponse([]) },
      assignManager: () => ({ status: 409, body: { error: 'target_has_scheduled_departure' } }),
    })
    await open(page)

    await page.getByTestId('organisation-assign-manager').click()
    await pickInDialog(page, /Nadia Okoro/)

    await expect(page.getByTestId('organisation-manager-error')).toContainText(
      /scheduled departure and can't take on reports/i
    )
  })

  test('fe-org-05 · a non-self 400 on manager assignment shows the generic copy, not the self copy', async ({
    page,
  }) => {
    await mockOrganisation(page, {
      relationships: { body: relationshipsResponse([]) },
      assignManager: () => ({ status: 400, body: { statusCode: 400, message: 'Bad Request' } }),
    })
    await open(page)

    await page.getByTestId('organisation-assign-manager').click()
    await pickInDialog(page, /Nadia Okoro/)

    await expect(page.getByTestId('organisation-manager-error')).toContainText(
      /couldn't assign the manager/i
    )
    await expect(page.getByTestId('organisation-manager-error')).not.toContainText(/their own/i)
  })

  test('fe-org-05 · a transport failure on manager assignment shows the network copy and does not refetch the journal', async ({
    page,
  }) => {
    const probe = await mockOrganisation(page, {
      relationships: { body: relationshipsResponse([]) },
      assignManager: () => ({ abort: true }),
    })
    await open(page)

    await page.getByTestId('organisation-assign-manager').click()
    await pickInDialog(page, /Nadia Okoro/)

    await expect(page.getByTestId('organisation-manager-error')).toContainText(
      /couldn't reach the server/i
    )
    await page.waitForLoadState('networkidle')
    expect(probe.journalRequests()).toHaveLength(1)
  })

  test('fe-org-09 · assigns a first People Partner (no current one): no confirm, PUT body { targetId }, journal refetches', async ({
    page,
  }) => {
    let rows = [...MANAGER_ONLY_ROWS]
    const probe = await mockOrganisation(page, {
      journal: () => ({ body: journalResponse(rows) }),
      relationships: { body: relationshipsResponse([managerEdge()]) },
      changePeoplePartner: () => {
        rows = [
          {
            id: 'evt-pp',
            occurredAt: '2026-05-01T10:00:00.000Z',
            actorUserId: 'actor',
            subjectUserId: SUBJECT_USER_ID,
            kind: 'people_partner',
            before: null,
            after: {
              relationshipId: 'r',
              userId: SUBJECT_USER_ID,
              type: 'people_partner',
              reportsToUserId: TARGET_USER_ID,
            },
          },
          ...rows,
        ]
        return { status: 200, body: { id: 'rel-pp-new' } }
      },
    })
    await open(page)

    await page.getByTestId('organisation-assign-pp').click()
    await pickInDialog(page, /Nadia Okoro/)

    await expect(page.getByTestId('organisation-people-partner')).toContainText(/just assigned/i)
    expect(probe.lastChangePpBody()).toEqual({ targetId: TARGET_USER_ID })
    await expect.poll(() => probe.journalRequests().length).toBeGreaterThan(1)
  })

  test('fe-org-10 · replacing an existing People Partner routes through a confirm step', async ({ page }) => {
    const probe = await mockOrganisation(page, {
      changePeoplePartner: () => ({ status: 200, body: { id: 'rel-pp-new' } }),
    })
    await open(page)

    await page.getByTestId('organisation-assign-pp').click()
    await pickInDialog(page, /Nadia Okoro/)

    const confirm = page.getByRole('alertdialog')
    await expect(confirm).toContainText(/Replace the current People Partner/i)
    await expect(confirm).toContainText(/Nadia Okoro/)
    expect(probe.changePpRequests()).toHaveLength(0)

    await confirm.getByRole('button', { name: /^replace$/i }).click()
    await expect(page.getByTestId('organisation-people-partner')).toContainText(/just assigned/i)
    expect(probe.lastChangePpBody()).toEqual({
      targetId: TARGET_USER_ID,
      expectedCurrentTargetId: SEEDED_PP_TARGET_ID,
    })
  })

  test('fe-org-10 · cancelling the People Partner replace confirm sends no PUT', async ({ page }) => {
    const probe = await mockOrganisation(page)
    await open(page)

    await page.getByTestId('organisation-assign-pp').click()
    await pickInDialog(page, /Nadia Okoro/)
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /^cancel$/i })
      .click()

    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    expect(probe.changePpRequests()).toHaveLength(0)
  })

  test('fe-org-11 · removes a People Partner: DELETE is sent and the section shows none', async ({ page }) => {
    const probe = await mockOrganisation(page, { removePeoplePartner: { status: 200 } })
    await open(page)

    await page.getByTestId('organisation-remove-pp').click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /^remove$/i })
      .click()

    await expect(page.getByTestId('organisation-pp-removed')).toBeVisible()
    expect(probe.removePpRequests()).toHaveLength(1)
    expect(probe.removePpRequests()[0].method).toBe('DELETE')
  })

  test('fe-org-11 · cancelling the People Partner remove confirm sends no DELETE', async ({ page }) => {
    const probe = await mockOrganisation(page)
    await open(page)

    await page.getByTestId('organisation-remove-pp').click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /^cancel$/i })
      .click()

    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    expect(probe.removePpRequests()).toHaveLength(0)
  })

  test('fe-org-11 · a 404 on People Partner removal explains there is nothing to remove', async ({ page }) => {
    await mockOrganisation(page, {
      removePeoplePartner: { status: 404, body: { statusCode: 404, message: 'Not Found' } },
    })
    await open(page)

    await page.getByTestId('organisation-remove-pp').click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /^remove$/i })
      .click()

    await expect(page.getByTestId('organisation-pp-error')).toContainText(
      /no People Partner to remove/i
    )
  })

  test.describe('People Partner assignment errors (no current PP — no confirm)', () => {
    test('fe-org-13 · 404 → unknown-target copy', async ({ page }) => {
      await mockOrganisation(page, {
        journal: { body: journalResponse(MANAGER_ONLY_ROWS) },
        relationships: { body: relationshipsResponse([managerEdge()]) },
        changePeoplePartner: () => ({ status: 404, body: { statusCode: 404 } }),
      })
      await open(page)
      await page.getByTestId('organisation-assign-pp').click()
      await pickInDialog(page, /Nadia Okoro/)
      await expect(page.getByTestId('organisation-pp-error')).toContainText(/couldn't be found/i)
    })

    test('fe-org-13 · 422 → inactive-target copy', async ({ page }) => {
      await mockOrganisation(page, {
        journal: { body: journalResponse(MANAGER_ONLY_ROWS) },
        relationships: { body: relationshipsResponse([managerEdge()]) },
        changePeoplePartner: () => ({ status: 422, body: { statusCode: 422 } }),
      })
      await open(page)
      await page.getByTestId('organisation-assign-pp').click()
      await pickInDialog(page, /Nadia Okoro/)
      await expect(page.getByTestId('organisation-pp-error')).toContainText(
        /isn't an active employee/i
      )
    })

    test('fe-org-13 · plain 409 → generic copy', async ({ page }) => {
      await mockOrganisation(page, {
        journal: { body: journalResponse(MANAGER_ONLY_ROWS) },
        relationships: { body: relationshipsResponse([managerEdge()]) },
        changePeoplePartner: () => ({ status: 409, body: { statusCode: 409 } }),
      })
      await open(page)
      await page.getByTestId('organisation-assign-pp').click()
      await pickInDialog(page, /Nadia Okoro/)
      await expect(page.getByTestId('organisation-pp-error')).toContainText(
        /couldn't update the People Partner/i
      )
    })

    test('fe-org-13 · 409 target_has_scheduled_departure → its own copy', async ({ page }) => {
      await mockOrganisation(page, {
        journal: { body: journalResponse(MANAGER_ONLY_ROWS) },
        relationships: { body: relationshipsResponse([managerEdge()]) },
        changePeoplePartner: () => ({
          status: 409,
          body: { error: 'target_has_scheduled_departure' },
        }),
      })
      await open(page)
      await page.getByTestId('organisation-assign-pp').click()
      await pickInDialog(page, /Nadia Okoro/)
      await expect(page.getByTestId('organisation-pp-error')).toContainText(
        /scheduled departure and can't be assigned/i
      )
    })

    test('fe-org-13 · non-self 400 → generic copy, not the self copy', async ({ page }) => {
      await mockOrganisation(page, {
        journal: { body: journalResponse(MANAGER_ONLY_ROWS) },
        relationships: { body: relationshipsResponse([managerEdge()]) },
        changePeoplePartner: () => ({ status: 400, body: { statusCode: 400 } }),
      })
      await open(page)
      await page.getByTestId('organisation-assign-pp').click()
      await pickInDialog(page, /Nadia Okoro/)
      await expect(page.getByTestId('organisation-pp-error')).toContainText(
        /couldn't update the People Partner/i
      )
      await expect(page.getByTestId('organisation-pp-error')).not.toContainText(/their own/i)
    })

    test('fe-org-13 · transport failure → network copy', async ({ page }) => {
      await mockOrganisation(page, {
        journal: { body: journalResponse(MANAGER_ONLY_ROWS) },
        relationships: { body: relationshipsResponse([managerEdge()]) },
        changePeoplePartner: () => ({ abort: true }),
      })
      await open(page)
      await page.getByTestId('organisation-assign-pp').click()
      await pickInDialog(page, /Nadia Okoro/)
      await expect(page.getByTestId('organisation-pp-error')).toContainText(
        /couldn't reach the server/i
      )
    })
  })

  test('fe-org-14 · a write 403 on the manager POST disables both sections and shows the permission notice', async ({
    page,
  }) => {
    await mockOrganisation(page, {
      relationships: { body: relationshipsResponse([]) },
      assignManager: () => ({ status: 403, body: { statusCode: 403, message: 'Forbidden' } }),
    })
    await open(page)

    await page.getByTestId('organisation-assign-manager').click()
    await pickInDialog(page, /Nadia Okoro/)

    await expect(page.getByTestId('organisation-manager-permission-notice')).toBeVisible()
    await expect(page.getByTestId('organisation-pp-permission-notice')).toBeVisible()
    await expect(page.getByTestId('organisation-assign-manager')).toHaveCount(0)
    await expect(page.getByTestId('organisation-assign-pp')).toHaveCount(0)
    await expect(page.getByTestId('organisation-remove-pp')).toHaveCount(0)
    await expect(page.getByTestId('organisation-journal-table')).toBeVisible()
  })

  test('fe-org-14 · a write 403 on the People Partner PUT disables both sections', async ({ page }) => {
    await mockOrganisation(page, {
      journal: { body: journalResponse(MANAGER_ONLY_ROWS) },
      relationships: { body: relationshipsResponse([managerEdge()]) },
      changePeoplePartner: () => ({ status: 403, body: { statusCode: 403 } }),
    })
    await open(page)

    await page.getByTestId('organisation-assign-pp').click()
    await pickInDialog(page, /Nadia Okoro/)

    await expect(page.getByTestId('organisation-manager-permission-notice')).toBeVisible()
    await expect(page.getByTestId('organisation-pp-permission-notice')).toBeVisible()
    await expect(page.getByTestId('organisation-assign-pp')).toHaveCount(0)
  })

  test('fe-org-14 · a write 403 on the People Partner DELETE disables both sections', async ({ page }) => {
    await mockOrganisation(page, {
      removePeoplePartner: { status: 403, body: { statusCode: 403 } },
    })
    await open(page)

    await page.getByTestId('organisation-remove-pp').click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /^remove$/i })
      .click()

    await expect(page.getByTestId('organisation-manager-permission-notice')).toBeVisible()
    await expect(page.getByTestId('organisation-pp-permission-notice')).toBeVisible()
    await expect(page.getByTestId('organisation-remove-pp')).toHaveCount(0)
  })

  test('fe-org-14 · a 403 from the directory disables the person picker', async ({ page }) => {
    await mockOrganisation(page, {
      relationships: { body: relationshipsResponse([]) },
      directory: { status: 403, body: { statusCode: 403, message: 'Forbidden' } },
    })
    await open(page)

    await page.getByTestId('organisation-assign-manager').click()
    await expect(page.getByTestId('person-picker-forbidden')).toBeVisible()
  })

  test('fe-org-15 · a 401 anywhere triggers the global redirect to /login', async ({ page }) => {
    await mockOrganisation(page, {
      journal: { status: 401, body: { statusCode: 401, message: 'Unauthorized' } },
    })
    await open(page)

    await expect(page).toHaveURL('/login')
    expect(await readStoredToken(page)).toBeNull()
  })

  test('fe-org-16 · the profile screen links through to the Organisation screen and shows the name', async ({
    page,
  }) => {
    await page.route(/\/users\/[^/]+\/events(?:\?.*)?$/, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], canEdit: false }),
      })
    )
    const card = {
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
    }
    await mockOrganisation(page, { subjectCard: { body: card } })
    await seedSession(page)
    await page.goto(`/employees/${SUBJECT_USER_ID}`)

    await page.getByTestId('profile-organisation-link').click()
    await expect(page).toHaveURL(ORG_URL)
    await expect(page.getByTestId('organisation-subject-name')).toHaveText('Sam Rivera')
    await expect(page.getByTestId('organisation-journal-table')).toBeVisible()
  })

  test('fe-org-06 · reassigns a manager: DELETE (current relationshipId) then POST (new target), and both reads refetch', async ({
    page,
  }) => {
    let journalRows = [...JOURNAL_ROWS]
    const probe = await mockOrganisation(page, {
      journal: () => ({ body: journalResponse(journalRows) }),
      relationships: { body: relationshipsResponse([managerEdge()]) },
      deleteRelationship: { status: 200 },
      assignManager: () => {
        journalRows = [managerRow(TARGET_USER_ID), ...journalRows]
        return { status: 201, body: { id: 'rel-new' } }
      },
    })
    await open(page)

    await expect(page.getByTestId('organisation-manager-derived-current')).toHaveText('Dana Mercer')
    await page.getByTestId('organisation-reassign-manager').click()
    await pickInDialog(page, /Nadia Okoro/)

    await expect(page.getByTestId('organisation-manager')).toContainText(/just assigned/i)
    expect(probe.deleteEdgeRequests()).toHaveLength(1)
    expect(probe.deleteEdgeRequests()[0].method).toBe('DELETE')
    expect(probe.deleteEdgeRequests()[0].url).toContain('rel-mgr-1')
    expect(probe.lastAssignManagerBody()).toEqual({ type: 'direct', targetId: TARGET_USER_ID })
    expect(probe.mutationOrder()).toEqual(['DELETE rel-mgr-1', 'POST relationships'])
    await expect.poll(() => probe.journalRequests().length).toBeGreaterThan(1)
  })

  test('fe-org-06 · a reassignment that fails after the delete shows the recovery copy; retry re-POSTs only', async ({
    page,
  }) => {
    let postAttempts = 0
    const probe = await mockOrganisation(page, {
      relationships: { body: relationshipsResponse([managerEdge()]) },
      deleteRelationship: { status: 200 },
      assignManager: () => {
        postAttempts += 1
        return postAttempts === 1
          ? { status: 500, body: { message: 'boom' } }
          : { status: 201, body: { id: 'rel-new' } }
      },
    })
    await open(page)

    await page.getByTestId('organisation-reassign-manager').click()
    await pickInDialog(page, /Nadia Okoro/)

    await expect(page.getByTestId('organisation-manager-partial-failure')).toContainText(
      /previous manager was removed/i
    )
    await expect(page.getByTestId('organisation-manager-partial-failure')).toContainText(
      /Nadia Okoro/
    )

    await page.getByTestId('organisation-manager-retry-reassign').click()
    await expect(page.getByTestId('organisation-manager')).toContainText(/just assigned/i)
    expect(probe.deleteEdgeRequests()).toHaveLength(1)
    expect(probe.assignManagerRequests()).toHaveLength(2)
  })

  test('fe-org-07 · an authoritative manager offers Remove; removing shows "none"', async ({ page }) => {
    const probe = await mockOrganisation(page, {
      relationships: { body: relationshipsResponse([managerEdge()]) },
      deleteRelationship: { status: 200 },
    })
    await open(page)

    await page.getByTestId('organisation-remove-manager').click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /^remove$/i })
      .click()

    await expect(page.getByTestId('organisation-manager-removed')).toBeVisible()
    expect(probe.deleteEdgeRequests()).toHaveLength(1)
    expect(probe.deleteEdgeRequests()[0].url).toContain('rel-mgr-1')
  })

  test('fe-org-08 · relationships 403 falls back to the journal-derived hint (assign only, no reassign)', async ({
    page,
  }) => {
    await mockOrganisation(page, {
      relationships: { status: 403, body: { statusCode: 403, message: 'Forbidden' } },
    })
    await open(page)

    await expect(page.getByTestId('organisation-manager-derived-assigned')).toContainText(
      'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
    )
    await expect(page.getByTestId('organisation-manager-derived-assigned')).toContainText(
      /from change history/i
    )
    await expect(page.getByTestId('organisation-manager-derived-note')).toBeVisible()
    await expect(page.getByTestId('organisation-assign-manager')).toBeVisible()
    await expect(page.getByTestId('organisation-reassign-manager')).toHaveCount(0)
  })

  test('fe-org-12 · a People Partner change and removal carry expectedCurrentTargetId', async ({ page }) => {
    const probe = await mockOrganisation(page, {
      changePeoplePartner: () => ({ status: 200, body: { id: 'rel-pp-new' } }),
    })
    await open(page)

    await expect(page.getByTestId('organisation-pp-derived-current')).toHaveText('Cora Pratt')

    await page.getByTestId('organisation-assign-pp').click()
    await pickInDialog(page, /Nadia Okoro/)
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /^replace$/i })
      .click()

    await expect(page.getByTestId('organisation-people-partner')).toContainText(/just assigned/i)
    expect(probe.lastChangePpBody()).toEqual({
      targetId: TARGET_USER_ID,
      expectedCurrentTargetId: SEEDED_PP_TARGET_ID,
    })
  })

  test('fe-org-12 · removing a People Partner sends the expectedCurrentTargetId query param', async ({
    page,
  }) => {
    const probe = await mockOrganisation(page, { removePeoplePartner: { status: 200 } })
    await open(page)

    await page.getByTestId('organisation-remove-pp').click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /^remove$/i })
      .click()

    await expect(page.getByTestId('organisation-pp-removed')).toBeVisible()
    expect(probe.removePpRequests()[0].url).toContain(
      `expectedCurrentTargetId=${SEEDED_PP_TARGET_ID}`
    )
  })

  test('fe-org-12 · a 409 on a People Partner change shows the stale-token copy with a refresh action', async ({
    page,
  }) => {
    const probe = await mockOrganisation(page, {
      changePeoplePartner: () => ({ status: 409, body: { statusCode: 409, message: 'Conflict' } }),
    })
    await open(page)

    await page.getByTestId('organisation-assign-pp').click()
    await pickInDialog(page, /Nadia Okoro/)
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /^replace$/i })
      .click()

    await expect(page.getByTestId('organisation-pp-stale')).toContainText(
      /People Partner changed since this screen loaded/i
    )
    const callsBefore = probe.relationshipsRequests().length
    await page.getByTestId('organisation-pp-refresh').click()
    await expect.poll(() => probe.relationshipsRequests().length).toBeGreaterThan(callsBefore)
  })
})
