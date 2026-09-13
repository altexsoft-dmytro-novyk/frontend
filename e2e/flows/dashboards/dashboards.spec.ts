import { test, expect } from '@playwright/test'
import {
  setupPopulatedDashboard,
  setupLoadingDashboard,
  setupZeroHeadcountDashboard,
  setupOmittedColumnsDashboard,
  setupAccessDeniedDashboard,
  setupUnauthenticatedDashboard,
} from './helpers'
import { mockPopulatedUnitManagerDashboard } from './fixtures'

test.describe('People Management Dashboards — Unit Manager (Story 2.1 / PMC-E2-S2.1)', () => {
  test.describe('FE-DASH-01 · Populated state with live scope, headcount, and people table', () => {
    test('default load opens Unit Manager preset with .pghd band, .prov tag, and people grouping active', async ({
      page,
    }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      // .pghd band & eyebrow
      const header = page.locator('.pghd')
      await expect(header).toBeVisible()
      await expect(header).toContainText('WORKSPACE / DASHBOARDS')

      // .prov tag stating live resolution scoped to dashboard header
      const provTag = header.locator('.prov')
      await expect(provTag).toBeVisible()
      await expect(provTag).toContainText('SCOPE RESOLVED LIVE PER REQUEST')

      // Unit Manager preset tab active
      const umTab = page.getByRole('tab', { name: /Unit Manager/i })
      await expect(umTab).toBeVisible()
      await expect(umTab).toHaveAttribute('aria-selected', 'true')

      // Grouping dimension control has People active with aria / data-state verification
      const peopleGrouping = page
        .getByRole('button', { name: /People/i })
        .or(page.getByRole('tab', { name: /People/i }))
        .or(page.getByRole('radio', { name: /People/i }))
        .or(page.locator('[data-grouping="people"]'))
      await expect(peopleGrouping).toBeVisible()

      const isGroupingActive = await peopleGrouping.evaluate((el) => {
        return (
          el.getAttribute('aria-pressed') === 'true' ||
          el.getAttribute('aria-selected') === 'true' ||
          el.getAttribute('aria-checked') === 'true' ||
          el.getAttribute('data-state') === 'active' ||
          el.getAttribute('data-state') === 'on' ||
          el.classList.contains('active')
        )
      })
      expect(isGroupingActive).toBe(true)
    })

    test('renders active headcount in data-stat mono with .wscope footer', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const headcountCard = page.getByTestId('dashboard-headcount-widget').or(page.locator('[data-widget="headcount"]'))
      await expect(headcountCard).toBeVisible()

      // Count value rendered in mono typography
      const countStat = headcountCard.locator('.data-stat').or(headcountCard.getByText('3', { exact: true }))
      await expect(countStat).toBeVisible()

      // .wscope footer belonging to headcount card
      const wscope = headcountCard.locator('.wscope, [data-slot="widget-scope-footer"]').filter({
        hasText: /SCOPE: REPORTING_LINE/i,
      })
      await expect(wscope).toBeVisible()
    })

    test('renders tier-projected people table rows for reporting-line employees with .wscope footer', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const tableContainer = page
        .getByTestId('dashboard-people-table-widget')
        .or(page.locator('[data-widget="people-table"]'))
        .or(page.locator('section').filter({ has: page.getByRole('table') }))
      await expect(tableContainer).toBeVisible()

      const table = tableContainer.getByRole('table').or(page.getByTestId('dashboard-people-table'))
      await expect(table).toBeVisible()

      // Rows for reporting-line employees
      await expect(table.getByText('Alice Smith')).toBeVisible()
      await expect(table.getByText('Bob Jones')).toBeVisible()
      await expect(table.getByText('Charlie Brown')).toBeVisible()

      // .wscope footer scoped specifically to the people-table container (not matching headcount wscope)
      const tableWscope = tableContainer.locator('.wscope, [data-slot="widget-scope-footer"]').filter({
        hasText: /SCOPE: REPORTING_LINE/i,
      })
      await expect(tableWscope).toBeVisible()
    })

    test('displays navigation shortcuts to related modules', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      // Navigation shortcuts
      await expect(page.getByRole('link', { name: /All Employees/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /Saved Views/i })).toBeVisible()
    })
  })

  test.describe('FE-DASH-02 · Dashboard loading state with Skeleton placeholders', () => {
    test('loading state renders Skeleton placeholders matching widget grid and table layout', async ({ page }) => {
      await setupLoadingDashboard(page)
      await page.goto('/dashboards')

      // Skeletons are visible matching layout
      const skeletons = page.locator('[data-skeleton="true"]').or(page.locator('.animate-pulse'))
      await expect(skeletons.first()).toBeVisible()
    })

    test('loading state does not render fake numeric values, NaN, or temporary zeros', async ({ page }) => {
      await setupLoadingDashboard(page)
      await page.goto('/dashboards')

      // Ensure no flash of NaN or raw numbers
      await expect(page.getByText('NaN')).not.toBeVisible()
      await expect(page.getByText('undefined')).not.toBeVisible()
      await expect(page.locator('.data-stat')).not.toBeVisible()
    })
  })

  test.describe('FE-DASH-03 · Legitimate zero headcount and empty scope', () => {
    test('measured zero headcount renders as 0 in data-stat mono with .wscope footer', async ({ page }) => {
      await setupZeroHeadcountDashboard(page)
      await page.goto('/dashboards')

      const headcountCard = page.getByTestId('dashboard-headcount-widget').or(page.locator('[data-widget="headcount"]'))
      await expect(headcountCard).toBeVisible()

      // Must display '0' as a legitimate measured value
      const zeroStat = headcountCard.getByText('0', { exact: true })
      await expect(zeroStat).toBeVisible()

      // Must have .wscope footer on headcount card
      const headcountWscope = headcountCard.locator('.wscope, [data-slot="widget-scope-footer"]').filter({
        hasText: /SCOPE: REPORTING_LINE/i,
      })
      await expect(headcountWscope).toBeVisible()
    })

    test('empty reporting scope renders the empty-state component instead of an error or table rows', async ({ page }) => {
      await setupZeroHeadcountDashboard(page)
      await page.goto('/dashboards')

      // .emptyst empty state component is rendered
      const emptyState = page.locator('.emptyst').or(page.getByTestId('dashboard-empty-state'))
      await expect(emptyState).toBeVisible()

      // No employee rows rendered
      await expect(page.getByText('Alice Smith')).not.toBeVisible()
    })

    test('zero is distinguishable from unavailable widget states', async ({ page }) => {
      await setupZeroHeadcountDashboard(page)
      await page.goto('/dashboards')

      const headcountCard = page.getByTestId('dashboard-headcount-widget').or(page.locator('[data-widget="headcount"]'))
      // Headcount widget is NOT shown as unavailable
      await expect(headcountCard.getByText(/unavailable/i)).not.toBeVisible()
      await expect(headcountCard.getByText('0', { exact: true })).toBeVisible()
    })
  })

  test.describe('FE-DASH-04 · Scope correctness and reporting-line isolation', () => {
    test('renders all reporting-line employee rows supplied by the read model', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      for (const row of mockPopulatedUnitManagerDashboard.peopleTable.data.rows) {
        await expect(page.getByText(`${row.firstName} ${row.lastName}`)).toBeVisible()
      }
    })

    test('does not add or fabricate employees outside the supplied read model', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      // An unentitled employee not in the read model must not appear
      await expect(page.getByText('Unknown Outside Employee')).not.toBeVisible()
      await expect(page.getByText('Unassigned Colleague')).not.toBeVisible()
    })

    test('renders the evaluated scope policy label and .wscope footer correctly', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const wscopeElements = page.locator('.wscope, [data-slot="widget-scope-footer"]')
      await expect(wscopeElements.first()).toBeVisible()
      await expect(wscopeElements.first()).toContainText('SCOPE: REPORTING_LINE')
    })
  })

  test.describe('FE-DASH-05 · Active headcount rendering', () => {
    test('faithfully renders the active headcount value supplied by the read model', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const headcountCard = page.getByTestId('dashboard-headcount-widget').or(page.locator('[data-widget="headcount"]'))
      await expect(headcountCard).toContainText('3')
    })

    test('renders the headcount metric in data-stat mono with .wscope footer', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const headcountCard = page.getByTestId('dashboard-headcount-widget').or(page.locator('[data-widget="headcount"]'))
      const statElem = headcountCard.locator('.data-stat').or(headcountCard.getByText('3', { exact: true }))
      await expect(statElem).toBeVisible()
      await expect(
        headcountCard.locator('.wscope, [data-slot="widget-scope-footer"]').filter({
          hasText: /SCOPE: REPORTING_LINE/i,
        })
      ).toBeVisible()
    })

    test('does not recompute or alter the supplied headcount value on the client', async ({ page }) => {
      // Pass a specific count in the read model
      await setupPopulatedDashboard(page, {
        headcount: {
          status: 'available',
          data: {
            count: 42,
            wscope: 'SCOPE: REPORTING_LINE',
          },
        },
      })
      await page.goto('/dashboards')

      const headcountCard = page.getByTestId('dashboard-headcount-widget').or(page.locator('[data-widget="headcount"]'))
      await expect(headcountCard).toContainText('42')
    })
  })

  test.describe('FE-DASH-06 · Tier-safe people table and uncovered columns', () => {
    test('renders shared read model fields permitted for reporting tier', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const table = page.getByRole('table').or(page.getByTestId('dashboard-people-table'))
      await expect(table).toBeVisible()

      // Select deterministic employee row to verify projection without relying on globally unique field values
      const aliceRow = table.getByRole('row').filter({ hasText: 'Alice Smith' })
      await expect(aliceRow).toBeVisible()
      await expect(aliceRow.getByText('Alice Smith')).toBeVisible()
      await expect(aliceRow.getByText('Senior Engineer')).toBeVisible()
      await expect(aliceRow.getByText('L4')).toBeVisible()
      await expect(aliceRow.getByText('Full-time')).toBeVisible()
    })

    test('handles uncovered project, leave, and risk columns via explicit unavailable states or column omission', async ({
      page,
    }) => {
      // 1. Case A: With explicitly declared unavailable columns
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const table = page.getByRole('table').or(page.getByTestId('dashboard-people-table'))
      await expect(table).toBeVisible()

      // If uncovered columns exist in the table, verify they render explicit unavailable indicators/badges
      const projectHeader = table.getByRole('columnheader', { name: /Project/i })
      const leaveHeader = table.getByRole('columnheader', { name: /Leave/i })
      const riskHeader = table.getByRole('columnheader', { name: /Risk/i })

      const hasProjectHeader = (await projectHeader.count()) > 0
      const hasLeaveHeader = (await leaveHeader.count()) > 0
      const hasRiskHeader = (await riskHeader.count()) > 0

      if (hasProjectHeader || hasLeaveHeader || hasRiskHeader) {
        const unavailableBadges = table
          .locator('.unavailable-column, [data-unavailable="true"]')
          .or(table.getByText(/Unavailable|Not connected/i))
        await expect(unavailableBadges.first()).toBeVisible()
        const badgeCount = await unavailableBadges.count()
        expect(badgeCount).toBeGreaterThan(0)
      }

      // 2. Case B: With completely omitted uncovered columns
      await setupOmittedColumnsDashboard(page)
      await page.goto('/dashboards')

      const omittedTable = page.getByRole('table').or(page.getByTestId('dashboard-people-table'))
      await expect(omittedTable).toBeVisible()
      await expect(omittedTable.getByText('Diana Prince')).toBeVisible()

      // Explicitly assert that uncovered column headers are absent when omitted
      await expect(omittedTable.getByRole('columnheader', { name: /^Project$/i })).not.toBeVisible()
      await expect(omittedTable.getByRole('columnheader', { name: /^Leave/i })).not.toBeVisible()
      await expect(omittedTable.getByRole('columnheader', { name: /^Risk/i })).not.toBeVisible()
    })

    test('does not render silently blank cells or fabricated values for missing source capabilities', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const table = page.getByRole('table').or(page.getByTestId('dashboard-people-table'))
      await expect(table).toBeVisible()

      // Ensure no blank cells with whitespace-only
      const emptyCells = table.locator('td:empty')
      await expect(emptyCells).toHaveCount(0)

      // Ensure no raw undefined / null / NaN text in table cells
      await expect(table.getByText('undefined', { exact: true })).not.toBeVisible()
      await expect(table.getByText('null', { exact: true })).not.toBeVisible()
      await expect(table.getByText('NaN', { exact: true })).not.toBeVisible()
    })
  })

  test.describe('FE-DASH-07 · Dashboard access denial and unauthenticated handling', () => {
    test('renders access-denied panel when dashboard-view permission is not held', async ({ page }) => {
      await setupAccessDeniedDashboard(page)
      await page.goto('/dashboards')

      // Fail-closed access denied UI using stable test ID
      const accessDeniedPanel = page.getByTestId('access-denied-panel')
      await expect(accessDeniedPanel).toBeVisible()
      await expect(accessDeniedPanel).toContainText(/Access denied|No permission/i)

      // Dashboard widgets and people table must NOT be rendered
      await expect(page.getByTestId('dashboard-headcount-widget')).not.toBeVisible()
      await expect(page.getByRole('table')).not.toBeVisible()
    })

    test('unauthenticated 401 response triggers the application global unauthenticated redirect handler', async ({
      page,
    }) => {
      await setupUnauthenticatedDashboard(page)
      await page.goto('/dashboards')

      // Expect global unauthenticated redirect to /login per FE-AUTH-01 / FE-EMP-07 / spec-frontend-foundation
      await expect(page).toHaveURL(/\/login(?:\?.*)?$/)
    })
  })

  test.describe('FE-DASH-08 · Preset navigation, keyboard accessibility, motion, and no customization', () => {
    test('preset tab strip displays Unit Manager preset only and is arrow-key navigable', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const tabList = page.getByRole('tablist')
      await expect(tabList).toBeVisible()

      // Only Unit Manager tab present in Epic 2 Story 2.1 scope (no DM/PM tabs)
      await expect(page.getByRole('tab', { name: /Unit Manager/i })).toBeVisible()
      await expect(page.getByRole('tab', { name: /Delivery Manager/i })).not.toBeVisible()
      await expect(page.getByRole('tab', { name: /Project Manager/i })).not.toBeVisible()

      // Arrow-key navigable
      const umTab = page.getByRole('tab', { name: /Unit Manager/i })
      await umTab.focus()
      await page.keyboard.press('ArrowRight')
      await expect(umTab).toBeFocused()
    })

    test('grouping dimension displays People as active', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const peopleGrouping = page
        .getByRole('button', { name: /People/i })
        .or(page.getByRole('tab', { name: /People/i }))
        .or(page.getByRole('radio', { name: /People/i }))
        .or(page.locator('[data-grouping="people"]'))
      await expect(peopleGrouping).toBeVisible()

      const isGroupingActive = await peopleGrouping.evaluate((el) => {
        return (
          el.getAttribute('aria-pressed') === 'true' ||
          el.getAttribute('aria-selected') === 'true' ||
          el.getAttribute('aria-checked') === 'true' ||
          el.getAttribute('data-state') === 'active' ||
          el.getAttribute('data-state') === 'on' ||
          el.classList.contains('active')
        )
      })
      expect(isGroupingActive).toBe(true)
    })

    test('prefers-reduced-motion disables transitions and animations', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      // Ensure Dashboard UI is rendered and interactive
      const dashboardHeader = page.locator('.pghd')
      await expect(dashboardHeader).toBeVisible()

      // Verify reduced-motion media query matches in browser context
      const mediaMatches = await page.evaluate(() => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      })
      expect(mediaMatches).toBe(true)

      // Query dashboard interactive/animated elements and verify motion is disabled
      const motionCheck = await page.evaluate(() => {
        const elements = Array.from(
          document.querySelectorAll(
            '.pghd, [role="tab"], [role="tablist"], [data-widget], [data-skeleton], .animate-pulse, .data-stat, aside, button'
          )
        )
        if (elements.length === 0) {
          return { elementsFound: 0, motionDisabled: false, failureReason: 'No dashboard elements found to inspect' }
        }

        for (const el of elements) {
          const style = window.getComputedStyle(el)
          const animDur = parseFloat(style.animationDuration) || 0
          const transDur = parseFloat(style.transitionDuration) || 0
          const animName = style.animationName

          // If animation is present, its duration must be effectively 0
          if (animName && animName !== 'none' && animDur > 0.05) {
            return {
              elementsFound: elements.length,
              motionDisabled: false,
              failureReason: `Element <${el.tagName.toLowerCase()} class="${el.className}"> has active animation ${animName} with duration ${style.animationDuration}`,
            }
          }

          // If transition is present, its duration must be effectively 0
          if (transDur > 0.05) {
            return {
              elementsFound: elements.length,
              motionDisabled: false,
              failureReason: `Element <${el.tagName.toLowerCase()} class="${el.className}"> has active transition duration ${style.transitionDuration}`,
            }
          }
        }

        return { elementsFound: elements.length, motionDisabled: true }
      })

      expect(motionCheck.elementsFound).toBeGreaterThan(0)
      expect(motionCheck.motionDisabled, motionCheck.failureReason).toBe(true)
    })

    test('customization affordances (customize mode, widget catalog, drag/remove handles, custom tabs) are absent', async ({
      page,
    }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      // Customization controls must be absent by construction (PM/AD-33, SD-1)
      await expect(page.getByRole('button', { name: /Customize/i })).not.toBeVisible()
      await expect(page.getByText(/Widget Catalog/i)).not.toBeVisible()
      await expect(page.locator('.drag-handle, [data-drag-handle]')).not.toBeVisible()
      await expect(page.locator('.remove-handle, [data-remove-widget]')).not.toBeVisible()
      await expect(page.getByRole('tab', { name: /\+ Custom/i })).not.toBeVisible()
    })
  })
})
