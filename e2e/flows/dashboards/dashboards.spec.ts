import { test, expect } from '@playwright/test'
import {
  setupPopulatedDashboard,
  setupLoadingDashboard,
  setupZeroHeadcountDashboard,
  setupOmittedColumnsDashboard,
  setupAccessDeniedDashboard,
  setupUnauthenticatedDashboard,
  setupPopulatedPeoplePartnerDashboard,
  setupZeroHeadcountPeoplePartnerDashboard,
  setupUnavailableIncompleteProfilesPeoplePartnerDashboard,
  setupDualPresetDashboard,
  setupPeoplePartnerLoadingDashboard,
  setupPeoplePartnerAccessDeniedDashboard,
  setupPeoplePartnerUnauthenticatedDashboard,
} from './helpers'
import {
  mockPopulatedUnitManagerDashboard,
  mockPopulatedPeoplePartnerDashboard,
  mockZeroHeadcountPeoplePartnerDashboard,
  mockUnavailableIncompleteProfilesPeoplePartnerDashboard,
} from './fixtures'

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
      const peopleGrouping = page.locator('[data-grouping="people"]')
      await expect(peopleGrouping).toBeVisible()
      await expect(peopleGrouping).toHaveAttribute('aria-pressed', 'true')
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

      // Scope navigation shortcuts to the Dashboard content panel
      const dashboardPanel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      await expect(dashboardPanel.getByRole('link', { name: /All Employees/i })).toBeVisible()
      await expect(dashboardPanel.getByRole('link', { name: /Saved Views/i })).toBeVisible()
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
    test('default Unit Manager preset remains selected and keyboard focusable', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const tabList = page.getByRole('tablist')
      await expect(tabList).toBeVisible()

      // Unit Manager tab present and selected by default (no DM/PM tabs)
      const umTab = page.getByRole('tab', { name: /Unit Manager/i })
      await expect(umTab).toBeVisible()
      await expect(umTab).toHaveAttribute('aria-selected', 'true')
      await expect(umTab).toHaveAttribute('tabindex', '0')
      await expect(page.getByRole('tab', { name: /Delivery Manager/i })).not.toBeVisible()
      await expect(page.getByRole('tab', { name: /Project Manager/i })).not.toBeVisible()

      // Preset tab strip is keyboard focusable
      await umTab.focus()
      await expect(umTab).toBeFocused()
    })

    test('grouping dimension displays People as active', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const peopleGrouping = page.locator('[data-grouping="people"]')
      await expect(peopleGrouping).toBeVisible()
      await expect(peopleGrouping).toHaveAttribute('aria-pressed', 'true')
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

test.describe('People Management Dashboards — Unsourced Widget Slots (Story 2.2 / PMC-E2-S2.2)', () => {
  test.describe('FE-DASH-09 · Explicit unavailable state rendering for uncovered widget slots with permission-literate messaging', () => {
    test('renders explicit unavailable card for uncovered risk counts slot (PM-FR-21)', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const riskSlot = panel.locator('[data-slot="riskCounts"]')

      await expect(riskSlot).toBeVisible()
      await expect(riskSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.riskCounts.missingCapability)).toBeVisible()
      await expect(riskSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.riskCounts.unavailableReason)).toBeVisible()
    })

    test('renders explicit unavailable card for uncovered unit action items and my action items slots (PM-FR-19)', async ({
      page,
    }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const unitActionSlot = panel.locator('[data-slot="unitActionItems"]')
      const myActionSlot = panel.locator('[data-slot="myActionItems"]')

      await expect(unitActionSlot).toBeVisible()
      await expect(unitActionSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.unitActionItems.missingCapability)).toBeVisible()
      await expect(unitActionSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.unitActionItems.unavailableReason)).toBeVisible()

      await expect(myActionSlot).toBeVisible()
      await expect(myActionSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.myActionItems.missingCapability)).toBeVisible()
      await expect(myActionSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.myActionItems.unavailableReason)).toBeVisible()
    })

    test('renders explicit unavailable card for uncovered resourcing requests slot (PM-FR-23)', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const resourcingSlot = panel.locator('[data-slot="resourcingRequests"]')

      await expect(resourcingSlot).toBeVisible()
      await expect(resourcingSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.resourcingRequests.missingCapability)).toBeVisible()
      await expect(resourcingSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.resourcingRequests.unavailableReason)).toBeVisible()
    })

    test('renders explicit unavailable card for uncovered open campaigns slot (PM-FR-20)', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const campaignsSlot = panel.locator('[data-slot="openCampaigns"]')

      await expect(campaignsSlot).toBeVisible()
      await expect(campaignsSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.openCampaigns.missingCapability)).toBeVisible()
      await expect(campaignsSlot.getByText(mockPopulatedUnitManagerDashboard.widgets.openCampaigns.unavailableReason)).toBeVisible()
    })

    test('displays missing capability name and explanation without apologetic or motivational filler across all unavailable slots', async ({
      page,
    }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const slotKeys = ['riskCounts', 'unitActionItems', 'myActionItems', 'resourcingRequests', 'openCampaigns'] as const

      for (const key of slotKeys) {
        const slot = panel.locator(`[data-slot="${key}"]`)
        await expect(slot).toBeVisible()
        await expect(slot.getByText(/sorry/i)).not.toBeVisible()
        await expect(slot.getByText(/coming soon/i)).not.toBeVisible()
        await expect(slot.getByText(/we('?re| are) working on this/i)).not.toBeVisible()
      }
    })
  })

  test.describe('FE-DASH-10 · Prevention of fake zero, dashes, blank space, empty charts, or fabricated data in unavailable slots', () => {
    test('unavailable risk slot does not render numeric 0, trend arrows, or fake risk chips', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const riskSlot = panel.locator('[data-slot="riskCounts"]')

      await expect(riskSlot).toBeVisible()

      // Negative assertions: no numeric counters, fake 0, trend arrows, or risk chips
      await expect(riskSlot.locator('.data-stat')).not.toBeVisible()
      await expect(riskSlot.getByText('0', { exact: true })).not.toBeVisible()
      await expect(riskSlot.getByText('—', { exact: true })).not.toBeVisible()
      await expect(riskSlot.locator('.rchip, .trend-arrow, [data-trend]')).not.toBeVisible()
      await expect(riskSlot.getByText(/low risk|medium risk|high risk/i)).not.toBeVisible()
    })

    test('unavailable action items slots do not render numeric 0, dashes, or blank list containers', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const unitActionSlot = panel.locator('[data-slot="unitActionItems"]')
      const myActionSlot = panel.locator('[data-slot="myActionItems"]')

      for (const slot of [unitActionSlot, myActionSlot]) {
        await expect(slot).toBeVisible()
        await expect(slot.locator('.data-stat')).not.toBeVisible()
        await expect(slot.getByText('0', { exact: true })).not.toBeVisible()
        await expect(slot.getByText('—', { exact: true })).not.toBeVisible()
        await expect(slot.locator('.task-item, [data-action-item]')).not.toBeVisible()
      }
    })

    test('unavailable resourcing slot does not render numeric 0, dashes, or empty chart visualizations', async ({
      page,
    }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const resourcingSlot = panel.locator('[data-slot="resourcingRequests"]')

      await expect(resourcingSlot).toBeVisible()
      await expect(resourcingSlot.locator('.data-stat')).not.toBeVisible()
      await expect(resourcingSlot.getByText('0', { exact: true })).not.toBeVisible()
      await expect(resourcingSlot.getByText('—', { exact: true })).not.toBeVisible()
      // Prohibit chart canvases, SVG chart graphics, and empty visualization containers (while allowing standard status icons)
      await expect(resourcingSlot.locator('canvas, .recharts-surface, [data-chart], .chart-container, svg.chart')).not.toBeVisible()
    })

    test('unavailable campaigns slot does not render numeric 0, dashes, or synthetic items', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const campaignsSlot = panel.locator('[data-slot="openCampaigns"]')

      await expect(campaignsSlot).toBeVisible()
      await expect(campaignsSlot.locator('.data-stat')).not.toBeVisible()
      await expect(campaignsSlot.getByText('0', { exact: true })).not.toBeVisible()
      await expect(campaignsSlot.getByText('—', { exact: true })).not.toBeVisible()
      await expect(campaignsSlot.locator('.campaign-item, [data-campaign-item]')).not.toBeVisible()
    })
  })

  test.describe('FE-DASH-11 · Multi-widget coexistence and independent slot metadata isolation', () => {
    test('renders all five unavailable widget slots coexisting alongside available headcount and people table widgets', async ({
      page,
    }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))

      // Available widgets from Story 2.1
      await expect(panel.getByTestId('dashboard-headcount-widget').or(panel.locator('[data-widget="headcount"]'))).toBeVisible()
      await expect(panel.getByTestId('dashboard-people-table-widget').or(panel.locator('[data-widget="people-table"]'))).toBeVisible()

      // All 5 unavailable slots coexist using canonical [data-slot="..."] identity
      await expect(panel.locator('[data-slot="riskCounts"]')).toBeVisible()
      await expect(panel.locator('[data-slot="unitActionItems"]')).toBeVisible()
      await expect(panel.locator('[data-slot="myActionItems"]')).toBeVisible()
      await expect(panel.locator('[data-slot="resourcingRequests"]')).toBeVisible()
      await expect(panel.locator('[data-slot="openCampaigns"]')).toBeVisible()
    })

    test('each unavailable widget slot renders from its own dedicated read-model property', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))

      const riskSlot = panel.locator('[data-slot="riskCounts"]')
      const resourcingSlot = panel.locator('[data-slot="resourcingRequests"]')
      const campaignsSlot = panel.locator('[data-slot="openCampaigns"]')

      await expect(riskSlot).toBeVisible()
      await expect(resourcingSlot).toBeVisible()
      await expect(campaignsSlot).toBeVisible()

      // Each distinct slot displays its own metadata
      await expect(riskSlot).toContainText(mockPopulatedUnitManagerDashboard.widgets.riskCounts.missingCapability)
      await expect(resourcingSlot).toContainText(mockPopulatedUnitManagerDashboard.widgets.resourcingRequests.missingCapability)
      await expect(campaignsSlot).toContainText(mockPopulatedUnitManagerDashboard.widgets.openCampaigns.missingCapability)
    })

    test('displays metadata supplied by each corresponding property without cross-slot substitution (allowing identical metadata where legitimately shared, such as PM-FR-19 action items)', async ({
      page,
    }) => {
      // Supply typed custom metadata to verify property-to-slot mapping integrity
      await setupPopulatedDashboard(page, {
        widgets: {
          riskCounts: {
            status: 'unavailable',
            missingCapability: 'Risk Intelligence',
            sourceFr: 'PM-FR-21',
            unavailableReason: 'Custom risk engine reason',
          },
          unitActionItems: {
            status: 'unavailable',
            missingCapability: 'Action Items Hub',
            sourceFr: 'PM-FR-19',
            unavailableReason: 'Shared action items explanation',
          },
          myActionItems: {
            status: 'unavailable',
            missingCapability: 'Action Items Hub',
            sourceFr: 'PM-FR-19',
            unavailableReason: 'Shared action items explanation',
          },
          resourcingRequests: {
            status: 'unavailable',
            missingCapability: 'Resourcing Pipeline',
            sourceFr: 'PM-FR-23',
            unavailableReason: 'Custom resourcing reason',
          },
          openCampaigns: {
            status: 'unavailable',
            missingCapability: 'Organizational Campaigns',
            sourceFr: 'PM-FR-20',
            unavailableReason: 'Custom campaigns reason',
          },
        },
      })
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))

      const riskSlot = panel.locator('[data-slot="riskCounts"]')
      const unitActionSlot = panel.locator('[data-slot="unitActionItems"]')
      const myActionSlot = panel.locator('[data-slot="myActionItems"]')
      const resourcingSlot = panel.locator('[data-slot="resourcingRequests"]')
      const campaignsSlot = panel.locator('[data-slot="openCampaigns"]')

      await expect(riskSlot).toBeVisible()
      await expect(unitActionSlot).toBeVisible()
      await expect(myActionSlot).toBeVisible()
      await expect(resourcingSlot).toBeVisible()
      await expect(campaignsSlot).toBeVisible()

      // Verify riskSlot received its specific metadata and NOT resourcing metadata
      await expect(riskSlot).toContainText('Risk Intelligence')
      await expect(riskSlot).toContainText('Custom risk engine reason')
      await expect(riskSlot).not.toContainText('Resourcing Pipeline')

      // Verify unitActionSlot and myActionSlot both display the shared PM-FR-19 metadata without error
      await expect(unitActionSlot).toContainText('Action Items Hub')
      await expect(unitActionSlot).toContainText('Shared action items explanation')
      await expect(myActionSlot).toContainText('Action Items Hub')
      await expect(myActionSlot).toContainText('Shared action items explanation')

      // Verify resourcingSlot and campaignsSlot received their specific metadata
      await expect(resourcingSlot).toContainText('Resourcing Pipeline')
      await expect(resourcingSlot).toContainText('Custom resourcing reason')
      await expect(campaignsSlot).toContainText('Organizational Campaigns')
      await expect(campaignsSlot).toContainText('Custom campaigns reason')
    })
  })

  test.describe('FE-DASH-12 · State disambiguation across unavailable source, legitimate measured zero, empty scope, loading skeleton, and access denial', () => {
    test('unavailable widget slots render unavailable cards and never display .emptyst empty state or numeric 0', async ({
      page,
    }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const riskSlot = panel.locator('[data-slot="riskCounts"]')

      await expect(riskSlot).toBeVisible()
      // Unavailable cards must NOT use the empty-state styling or data-stat counters
      await expect(riskSlot.locator('.emptyst, [data-testid="dashboard-empty-state"]')).not.toBeVisible()
      await expect(riskSlot.locator('.data-stat')).not.toBeVisible()
    })

    test('legitimate zero headcount (FE-DASH-03) does not render an unavailable card in headcount slot', async ({ page }) => {
      await setupZeroHeadcountDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const headcountCard = panel.getByTestId('dashboard-headcount-widget').or(panel.locator('[data-widget="headcount"]'))

      await expect(headcountCard).toBeVisible()
      await expect(headcountCard.locator('.data-stat').or(headcountCard.getByText('0', { exact: true }))).toBeVisible()
      // Headcount widget must NOT be marked or rendered as an unavailable card
      await expect(headcountCard.locator('[data-slot="riskCounts"], [data-slot="unitActionItems"], [data-slot="myActionItems"]')).not.toBeVisible()
      await expect(headcountCard.getByText(/unavailable|not implemented/i)).not.toBeVisible()
    })

    test('empty reporting scope (FE-DASH-03) renders .emptyst empty-state component and does not replace the table with an unavailable card', async ({
      page,
    }) => {
      await setupZeroHeadcountDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const peopleTableSection = panel.getByTestId('dashboard-people-table-widget').or(panel.locator('[data-widget="people-table"]'))

      await expect(peopleTableSection).toBeVisible()
      // Empty scope renders .emptyst component
      const emptyState = peopleTableSection.locator('.emptyst, [data-testid="dashboard-empty-state"]')
      await expect(emptyState).toBeVisible()
      // Table container must NOT be replaced with an unavailable card
      await expect(peopleTableSection.locator('[data-slot="riskCounts"], [data-slot="unitActionItems"], [data-slot="myActionItems"], [data-slot="resourcingRequests"], [data-slot="openCampaigns"]')).not.toBeVisible()
    })
  })

  test.describe('FE-DASH-13 · Semantic structure, accessibility, responsive layout, and lack of customization for unavailable widget cards', () => {
    test('unavailable widget cards have semantic structure and accessible headings readable by screen readers', async ({
      page,
    }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const riskSlot = panel.locator('[data-slot="riskCounts"]')

      await expect(riskSlot).toBeVisible()
      // Must contain an accessible heading (h3, h4, or element with heading role)
      const heading = riskSlot.getByRole('heading').or(riskSlot.locator('h3, h4'))
      await expect(heading.first()).toBeVisible()
      await expect(heading.first()).toHaveText(/Risk/i)
    })

    test('unavailable widget cards maintain responsive grid layout without layout shifts or overflow', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const riskSlot = panel.locator('[data-slot="riskCounts"]')

      await expect(riskSlot).toBeVisible()

      // Bounding box must fit within container client width (no horizontal overflow)
      const isLayoutStable = await riskSlot.evaluate((el) => {
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0 && el.scrollWidth <= el.clientWidth + 2
      })
      expect(isLayoutStable).toBe(true)
    })

    test('unavailable widget cards do not introduce interactive focus traps or unexpected tabbable descendants', async ({
      page,
    }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const slotKeys = ['riskCounts', 'unitActionItems', 'myActionItems', 'resourcingRequests', 'openCampaigns'] as const

      // All five cards must exist and not contain focusable/tabbable interactive descendants
      for (const key of slotKeys) {
        const card = panel.locator(`[data-slot="${key}"]`)
        await expect(card).toBeVisible()

        const focusableDescendants = card.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
        await expect(focusableDescendants).toHaveCount(0)
      }
    })

    test('no customize handles, drag affordances, or remove buttons exist on unavailable cards', async ({ page }) => {
      await setupPopulatedDashboard(page)
      await page.goto('/dashboards')

      const panel = page.getByRole('tabpanel').or(page.locator('#preset-panel-unit-manager, main'))
      const slotKeys = ['riskCounts', 'unitActionItems', 'myActionItems', 'resourcingRequests', 'openCampaigns'] as const

      for (const key of slotKeys) {
        const card = panel.locator(`[data-slot="${key}"]`)
        await expect(card).toBeVisible()

        // Customization handles must be absent from unavailable cards (PM/AD-33, SD-1)
        await expect(card.locator('.drag, .drag-handle, [data-drag-handle]')).not.toBeVisible()
        await expect(card.locator('.rm, .remove-handle, [data-remove-widget]')).not.toBeVisible()
        await expect(card.getByRole('button', { name: /Add widget|Add to dashboard|Remove/i })).not.toBeVisible()
      }
    })
  })
})

test.describe('People Management Dashboards — People Partner (Story 2.3 / PMC-E2-S2.3)', () => {
  test.describe('FE-DASH-14 · Populated People Partner dashboard state with live direct PP assignment scope, headcount, people table, and HR widgets', () => {
    test('selecting People Partner preset renders .pghd band, .prov tag, and people grouping active', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      // People Partner preset tab exists and can be selected
      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()
      await expect(ppTab).toHaveAttribute('aria-selected', 'true')

      // .pghd band & eyebrow
      const header = page.locator('.pghd')
      await expect(header).toBeVisible()
      await expect(header).toContainText('WORKSPACE / DASHBOARDS')

      // .prov tag stating live resolution scoped to dashboard header
      const provTag = header.locator('.prov')
      await expect(provTag).toBeVisible()
      await expect(provTag).toContainText('SCOPE RESOLVED LIVE PER REQUEST')

      // Grouping dimension control has People active with aria / data-state verification
      const peopleGrouping = page.locator('#preset-panel-people-partner [data-grouping="people"]')
      await expect(peopleGrouping).toBeVisible()
      await expect(peopleGrouping).toHaveAttribute('aria-pressed', 'true')
    })

    test('renders active caseload headcount in data-stat mono with .wscope footer (SCOPE: PEOPLE_PARTNER_ASSIGNMENT)', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const panel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const headcountCard = panel.locator('[data-slot="headcount"]').or(panel.locator('section:has-text("Headcount")'))
      await expect(headcountCard).toBeVisible()

      // Count rendered in data-stat mono
      const stat = headcountCard.locator('.data-stat, .tabular-nums, [data-stat]').first()
      await expect(stat).toBeVisible()
      await expect(stat).toHaveText('3')

      // Scope footer stating direct People Partner assignment
      const scopeFooter = headcountCard.locator('.wscope, [data-wscope]')
      await expect(scopeFooter).toBeVisible()
      await expect(scopeFooter).toHaveText('SCOPE: PEOPLE_PARTNER_ASSIGNMENT')
    })

    test('renders tier-projected people table rows for PP-assigned employees with .wscope footer', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const panel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const table = panel.getByRole('table').or(panel.locator('table'))
      await expect(table).toBeVisible()

      // Verify each PP fixture employee is rendered in the table
      const expectedRows = mockPopulatedPeoplePartnerDashboard.peopleTable.data.rows
      for (const row of expectedRows) {
        const rowLocator = table.locator(`tr:has-text("${row.firstName} ${row.lastName}")`)
        await expect(rowLocator).toBeVisible()
        if (row.position) {
          await expect(rowLocator).toContainText(row.position)
        }
        if (row.grade) {
          await expect(rowLocator).toContainText(row.grade)
        }
      }

      // People table .wscope footer
      const tableScopeFooter = panel.locator('[data-slot="peopleTable"] .wscope, [data-slot="peopleTable"] [data-wscope], table + .wscope, .table-container .wscope').first()
      await expect(tableScopeFooter).toBeVisible()
      await expect(tableScopeFooter).toHaveText('SCOPE: PEOPLE_PARTNER_ASSIGNMENT')
    })

    test('displays People Partner navigation shortcuts (including departures and excluding resourcing)', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const panel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const navContainer = panel.locator('[data-slot="navigationShortcuts"]').or(panel.locator('section:has-text("Shortcuts"), div:has-text("Shortcuts")')).first()
      await expect(navContainer).toBeVisible()

      // Required PP shortcuts
      await expect(navContainer.getByRole('link', { name: /All Employees/i })).toHaveAttribute('href', '/employees')
      await expect(navContainer.getByRole('link', { name: /Saved Views/i })).toHaveAttribute('href', '/employees/views')
      await expect(navContainer.getByRole('link', { name: /Campaigns/i })).toHaveAttribute('href', '/campaigns')
      await expect(navContainer.getByRole('link', { name: /Departures/i })).toHaveAttribute('href', '/departures')

      // Resourcing shortcut must NOT exist in PP navigation shortcuts
      await expect(navContainer.getByRole('link', { name: /Resourcing/i })).toHaveCount(0)
      await expect(navContainer.locator('a[href*="/resourcing"]')).toHaveCount(0)
    })

    test('renders available incomplete profiles HR widget with data-stat mono and .wscope footer', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const panel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const incompleteCard = panel.locator('[data-slot="incompleteProfiles"]')
      await expect(incompleteCard).toBeVisible()

      // Metric count rendered in data-stat mono
      const stat = incompleteCard.locator('.data-stat, .tabular-nums, [data-stat]').first()
      await expect(stat).toBeVisible()
      await expect(stat).toHaveText('1')

      // .wscope footer stating direct People Partner assignment
      const scopeFooter = incompleteCard.locator('.wscope, [data-wscope]')
      await expect(scopeFooter).toBeVisible()
      await expect(scopeFooter).toHaveText('SCOPE: PEOPLE_PARTNER_ASSIGNMENT')
    })
  })

  test.describe('FE-DASH-15 · Complete absence of resourcing functionality by construction in People Partner preset', () => {
    test('resourcing widget slot is completely absent from the People Partner dashboard preset panel by construction', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      await expect(ppPanel).toBeVisible()

      // Absolute absence of resourcing slot in PP panel
      await expect(ppPanel.locator('[data-slot="resourcingRequests"]')).toHaveCount(0)
      await expect(ppPanel.locator('[data-widget="resourcing"]')).toHaveCount(0)
    })

    test('no resourcing card, counter, unavailable placeholder, or reserved slot exists in the PP widget grid', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      await expect(ppPanel).toBeVisible()

      // No element inside PP panel displays a Resourcing heading or card
      await expect(ppPanel.getByRole('heading', { name: /Resourcing/i })).toHaveCount(0)
      await expect(ppPanel.locator('section:has-text("Resourcing")')).toHaveCount(0)

      // Verified approved PP widget identities exist in the PP widget grid
      await expect(ppPanel.locator('[data-slot="incompleteProfiles"]')).toBeVisible()
      await expect(ppPanel.locator('[data-slot="riskCounts"]')).toBeVisible()
      await expect(ppPanel.locator('[data-slot="assignedActionItems"]')).toBeVisible()
      await expect(ppPanel.locator('[data-slot="cdsMilestones"]')).toBeVisible()
      await expect(ppPanel.locator('[data-slot="campaignCompletion"]')).toBeVisible()

      // Unit-Manager-only and resourcing slots must NOT exist in the PP widget grid
      await expect(ppPanel.locator('[data-slot="unitActionItems"]')).toHaveCount(0)
      await expect(ppPanel.locator('[data-slot="myActionItems"]')).toHaveCount(0)
      await expect(ppPanel.locator('[data-slot="openCampaigns"]')).toHaveCount(0)
      await expect(ppPanel.locator('[data-slot="resourcingRequests"]')).toHaveCount(0)
    })

    test('People Partner navigation shortcuts container does not render a link or shortcut to resourcing', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const navContainer = ppPanel.locator('[data-slot="navigationShortcuts"]').or(ppPanel.locator('section:has-text("Shortcuts"), div:has-text("Shortcuts")')).first()
      await expect(navContainer).toBeVisible()

      await expect(navContainer.getByRole('link', { name: /Resourcing/i })).toHaveCount(0)
      await expect(navContainer.locator('a[href*="/resourcing"]')).toHaveCount(0)
    })
  })

  test.describe('FE-DASH-16 · People Partner scope isolation and non-merging with reporting-line direct reports', () => {
    test('People Partner people table renders exactly the PP rows supplied by the read model', async ({
      page,
    }) => {
      await setupDualPresetDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const panel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const table = panel.getByRole('table').or(panel.locator('table'))
      await expect(table).toBeVisible()

      // Exactly the PP fixture rows must be rendered
      const expectedRows = mockPopulatedPeoplePartnerDashboard.peopleTable.data.rows
      for (const row of expectedRows) {
        await expect(table.locator(`tbody tr:has-text("${row.firstName} ${row.lastName}")`)).toBeVisible()
      }

      // Verify exact data-row count in tbody equals supplied PP fixture row count (excluding header rows)
      const dataRows = table.locator('tbody tr')
      await expect(dataRows).toHaveCount(expectedRows.length)
    })

    test('reporting-line fixture employees do not appear in the People Partner people table', async ({
      page,
    }) => {
      await setupDualPresetDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const panel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const table = panel.getByRole('table').or(panel.locator('table'))
      await expect(table).toBeVisible()

      // Reporting-line direct reports from UM fixture must NOT appear in PP table
      await expect(table.locator('tr:has-text("Alice Smith")')).toHaveCount(0)
      await expect(table.locator('tr:has-text("Bob Jones")')).toHaveCount(0)
      await expect(table.locator('tr:has-text("Charlie Brown")')).toHaveCount(0)
      await expect(table.locator('tr:has-text("Diana Prince")')).toHaveCount(0)
    })

    test('displayed People Partner headcount faithfully renders the count supplied by the read model without client-side merging', async ({
      page,
    }) => {
      await setupDualPresetDashboard(page, {
        ppData: {
          headcount: {
            status: 'available',
            data: {
              count: 17,
              wscope: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT',
            },
          },
        },
      })
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const panel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const headcountCard = panel.locator('[data-slot="headcount"]').or(panel.locator('section:has-text("Headcount")'))
      await expect(headcountCard).toBeVisible()

      // Faithfully matches distinctive supplied PP count (17), not PP row count (3), UM headcount (3), or combined count (20)
      const stat = headcountCard.locator('.data-stat, .tabular-nums, [data-stat]').first()
      await expect(stat).toBeVisible()
      await expect(stat).toHaveText('17')

      const scopeFooter = headcountCard.locator('.wscope, [data-wscope]')
      await expect(scopeFooter).toBeVisible()
      await expect(scopeFooter).toHaveText('SCOPE: PEOPLE_PARTNER_ASSIGNMENT')
    })
  })

  test.describe('FE-DASH-17 · Dashboard preset navigation, multi-preset switching, and ARIA tab semantics', () => {
    test('preset tab strip renders both Unit Manager and People Partner preset tabs with proper ARIA tab semantics', async ({
      page,
    }) => {
      await setupDualPresetDashboard(page)
      await page.goto('/dashboards')

      const tablist = page.getByRole('tablist', { name: /Dashboard Presets/i }).or(page.locator('[role="tablist"]'))
      await expect(tablist).toBeVisible()

      const umTab = tablist.getByRole('tab', { name: /Unit Manager/i })
      const ppTab = tablist.getByRole('tab', { name: /People Partner/i })

      await expect(umTab).toBeVisible()
      await expect(ppTab).toBeVisible()

      // ARIA tab semantics
      await expect(umTab).toHaveAttribute('aria-selected', 'true')
      await expect(ppTab).toHaveAttribute('aria-selected', 'false')

      await expect(umTab).toHaveAttribute('aria-controls', /preset-panel-unit-manager|unit-manager/)
      await expect(ppTab).toHaveAttribute('aria-controls', /preset-panel-people-partner|people-partner/)
    })

    test('switching from Unit Manager to People Partner preset renders PP read model with direct PP scope and no resourcing', async ({
      page,
    }) => {
      await setupDualPresetDashboard(page)
      await page.goto('/dashboards')

      const tablist = page.getByRole('tablist', { name: /Dashboard Presets/i }).or(page.locator('[role="tablist"]'))
      const umTab = tablist.getByRole('tab', { name: /Unit Manager/i })
      const ppTab = tablist.getByRole('tab', { name: /People Partner/i })

      // Initial state: Unit Manager active
      await expect(umTab).toHaveAttribute('aria-selected', 'true')
      await expect(page.locator('.wscope').first()).toHaveText('SCOPE: REPORTING_LINE')

      // Switch to People Partner
      await ppTab.click()

      await expect(ppTab).toHaveAttribute('aria-selected', 'true')
      await expect(umTab).toHaveAttribute('aria-selected', 'false')

      // People Partner scope is rendered
      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const headcountCard = ppPanel.locator('[data-slot="headcount"]').or(ppPanel.locator('section:has-text("Headcount")'))
      await expect(headcountCard.locator('.wscope, [data-wscope]')).toHaveText('SCOPE: PEOPLE_PARTNER_ASSIGNMENT')

      // PP people table rendered
      const table = ppPanel.getByRole('table').or(ppPanel.locator('table'))
      await expect(table.locator('tr:has-text("Elena Rostova")')).toBeVisible()

      // Resourcing slot is absent in active PP panel
      await expect(ppPanel.locator('[data-slot="resourcingRequests"]')).toHaveCount(0)
    })

    test('switching back to Unit Manager preset preserves Unit Manager reporting-line scope and Story 2.1/2.2 widgets', async ({
      page,
    }) => {
      await setupDualPresetDashboard(page)
      await page.goto('/dashboards')

      const tablist = page.getByRole('tablist', { name: /Dashboard Presets/i }).or(page.locator('[role="tablist"]'))
      const umTab = tablist.getByRole('tab', { name: /Unit Manager/i })
      const ppTab = tablist.getByRole('tab', { name: /People Partner/i })

      await expect(ppTab).toBeVisible()
      await ppTab.click()
      await expect(ppTab).toHaveAttribute('aria-selected', 'true')

      // Switch back to Unit Manager
      await umTab.click()
      await expect(umTab).toHaveAttribute('aria-selected', 'true')
      await expect(ppTab).toHaveAttribute('aria-selected', 'false')

      // Unit Manager content restored
      const umPanel = page.locator('#preset-panel-unit-manager').or(page.getByRole('tabpanel'))
      const headcountCard = umPanel.locator('[data-slot="headcount"]').or(umPanel.locator('section:has-text("Headcount")'))
      await expect(headcountCard.locator('.wscope, [data-wscope]')).toHaveText('SCOPE: REPORTING_LINE')

      // UM people table restored
      const table = umPanel.getByRole('table').or(umPanel.locator('table'))
      await expect(table.locator('tr:has-text("Alice Smith")')).toBeVisible()

      // UM resourcing slot restored
      await expect(umPanel.locator('[data-slot="resourcingRequests"]')).toBeVisible()
    })

    test('preset tab strip supports keyboard arrow navigation (ArrowLeft, ArrowRight, Home, End)', async ({
      page,
    }) => {
      await setupDualPresetDashboard(page)
      await page.goto('/dashboards')

      const tablist = page.getByRole('tablist', { name: /Dashboard Presets/i }).or(page.locator('[role="tablist"]'))
      const umTab = tablist.getByRole('tab', { name: /Unit Manager/i })
      const ppTab = tablist.getByRole('tab', { name: /People Partner/i })

      // Focus UM tab
      await umTab.focus()
      await expect(umTab).toBeFocused()

      // ArrowRight moves focus to PP tab
      await page.keyboard.press('ArrowRight')
      await expect(ppTab).toBeFocused()

      // ArrowLeft moves focus back to UM tab
      await page.keyboard.press('ArrowLeft')
      await expect(umTab).toBeFocused()

      // End key moves to last tab (PP tab)
      await page.keyboard.press('End')
      await expect(ppTab).toBeFocused()

      // Home key moves to first tab (UM tab)
      await page.keyboard.press('Home')
      await expect(umTab).toBeFocused()
    })
  })

  test.describe('FE-DASH-18 · People Partner explicit unavailable HR widget slots and honest availability rendering', () => {
    test('renders explicit unavailable card for uncovered PP risk counts slot (PM-FR-21)', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const card = ppPanel.locator('[data-slot="riskCounts"]')
      await expect(card).toBeVisible()

      // Missing capability heading and unavailable badge
      await expect(card.getByRole('heading', { name: /Risk Tracking/i })).toBeVisible()
      await expect(card.getByText('Unavailable', { exact: true })).toBeVisible()
      await expect(card).toContainText('PM-FR-21 risk engine is uncovered')

      // Scope footer must NOT be rendered on unavailable cards
      await expect(card.locator('.wscope, [data-wscope]')).toHaveCount(0)
    })

    test('renders explicit unavailable card for uncovered assigned action items slot (PM-FR-19)', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const card = ppPanel.locator('[data-slot="assignedActionItems"]')
      await expect(card).toBeVisible()

      await expect(card.getByRole('heading', { name: /Assigned Action Items/i })).toBeVisible()
      await expect(card.getByText('Unavailable', { exact: true })).toBeVisible()
      await expect(card).toContainText('PM-FR-19 action item lifecycle is uncovered')

      await expect(card.locator('.wscope, [data-wscope]')).toHaveCount(0)
    })

    test('renders explicit unavailable card for uncovered CDS milestones slot (PM-FR-30)', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const card = ppPanel.locator('[data-slot="cdsMilestones"]')
      await expect(card).toBeVisible()

      await expect(card.getByRole('heading', { name: /CDS Milestones/i })).toBeVisible()
      await expect(card.getByText('Unavailable', { exact: true })).toBeVisible()
      await expect(card).toContainText('PM-FR-30 career development service is uncovered')

      await expect(card.locator('.wscope, [data-wscope]')).toHaveCount(0)
    })

    test('renders explicit unavailable card for uncovered HR form campaigns completion slot (PM-FR-20)', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const card = ppPanel.locator('[data-slot="campaignCompletion"]')
      await expect(card).toBeVisible()

      await expect(card.getByRole('heading', { name: /Campaign Completion/i })).toBeVisible()
      await expect(card.getByText('Unavailable', { exact: true })).toBeVisible()
      await expect(card).toContainText('PM-FR-20 campaigns lifecycle is uncovered')

      await expect(card.locator('.wscope, [data-wscope]')).toHaveCount(0)
    })

    test('renders incomplete profiles widget as an explicit unavailable card without .wscope footer when marked unavailable', async ({
      page,
    }) => {
      await setupUnavailableIncompleteProfilesPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const card = ppPanel.locator('[data-slot="incompleteProfiles"]')
      await expect(card).toBeVisible()

      await expect(card.getByRole('heading', { name: /Incomplete Profiles/i })).toBeVisible()
      await expect(card.getByText('Unavailable', { exact: true })).toBeVisible()
      await expect(card).toContainText('Profile completion calculation is uncovered')

      // Scope footer must NOT be rendered when incompleteProfiles is unavailable
      await expect(card.locator('.wscope, [data-wscope]')).toHaveCount(0)
    })

    test('prevents fake zero, dashes, blank containers, or chart DOM in PP unavailable slots', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const unavailableSlots = ['riskCounts', 'assignedActionItems', 'cdsMilestones', 'campaignCompletion'] as const

      for (const slot of unavailableSlots) {
        const card = ppPanel.locator(`[data-slot="${slot}"]`)
        await expect(card).toBeVisible()

        // No fake zero in numeric stat display
        const stat = card.locator('.data-stat, .tabular-nums')
        await expect(stat).toHaveCount(0)

        // No dashes standing in for zero (exact text matches to avoid matching hyphens in copy or requirement identifiers)
        await expect(card.getByText('—', { exact: true })).toHaveCount(0)
        await expect(card.getByText('-', { exact: true })).toHaveCount(0)

        // No fake chart visualization canvases or svg charts
        await expect(card.locator('canvas, svg.chart, [data-chart]')).toHaveCount(0)

        // No synthetic list or fake chips
        await expect(card.locator('ul, ol, .chip, [data-chip]')).toHaveCount(0)
      }
    })

    test('renders distinct PP HR widget slots coexisting in the grid without metadata cross-contamination', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))

      // All contract slots must coexist in the grid
      const riskCard = ppPanel.locator('[data-slot="riskCounts"]')
      const actionItemsCard = ppPanel.locator('[data-slot="assignedActionItems"]')
      const cdsCard = ppPanel.locator('[data-slot="cdsMilestones"]')
      const campaignsCard = ppPanel.locator('[data-slot="campaignCompletion"]')
      const incompleteCard = ppPanel.locator('[data-slot="incompleteProfiles"]')

      await expect(riskCard).toBeVisible()
      await expect(actionItemsCard).toBeVisible()
      await expect(cdsCard).toBeVisible()
      await expect(campaignsCard).toBeVisible()
      await expect(incompleteCard).toBeVisible()

      // Verify each slot displays its own unique metadata
      await expect(riskCard.getByRole('heading', { name: /Risk Tracking/i })).toBeVisible()
      await expect(actionItemsCard.getByRole('heading', { name: /Assigned Action Items/i })).toBeVisible()
      await expect(cdsCard.getByRole('heading', { name: /CDS Milestones/i })).toBeVisible()
      await expect(campaignsCard.getByRole('heading', { name: /Campaign Completion/i })).toBeVisible()
    })
  })

  test.describe('FE-DASH-19 · People Partner legitimate zero headcount, empty scope, loading skeletons, and access denial', () => {
    test('renders legitimate zero caseload headcount as 0 in data-stat mono with .wscope footer', async ({
      page,
    }) => {
      await setupZeroHeadcountPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const headcountCard = ppPanel.locator('[data-slot="headcount"]').or(ppPanel.locator('section:has-text("Headcount")'))
      await expect(headcountCard).toBeVisible()

      // Numeric 0 rendered in data-stat mono
      const stat = headcountCard.locator('.data-stat, .tabular-nums, [data-stat]').first()
      await expect(stat).toBeVisible()
      await expect(stat).toHaveText('0')

      // Scope footer is present
      const scopeFooter = headcountCard.locator('.wscope, [data-wscope]')
      await expect(scopeFooter).toBeVisible()
      await expect(scopeFooter).toHaveText('SCOPE: PEOPLE_PARTNER_ASSIGNMENT')

      // Zero headcount is NOT rendered as an unavailable card
      await expect(headcountCard.getByText('Unavailable', { exact: true })).toHaveCount(0)
    })

    test('renders .emptyst empty-state component for zero assigned employees in PP people table', async ({
      page,
    }) => {
      await setupZeroHeadcountPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const emptyState = ppPanel.locator('.emptyst, [data-slot="empty-state"]')
      await expect(emptyState).toBeVisible()

      // No employee data rows rendered
      const table = ppPanel.locator('table')
      await expect(table.locator('tbody tr')).toHaveCount(0)
    })

    test('renders layout-matching Skeleton placeholders during pending load for People Partner preset', async ({
      page,
    }) => {
      await setupPeoplePartnerLoadingDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      // Skeletons must be rendered
      const skeletons = page.locator('[data-slot="skeleton"], .skeleton, [class*="animate-pulse"]')
      await expect(skeletons.first()).toBeVisible()

      // No raw NaN or undefined text displayed during loading
      await expect(page.getByText('NaN')).not.toBeVisible()
      await expect(page.getByText('undefined')).not.toBeVisible()
    })

    test('renders fail-closed AccessDeniedPanel when dashboard permission is missing for People Partner preset', async ({
      page,
    }) => {
      await setupPeoplePartnerAccessDeniedDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      // AccessDeniedPanel must be rendered
      const accessDenied = page.getByTestId('access-denied-panel')
      await expect(accessDenied).toBeVisible()
    })

    test('triggers global unauthenticated redirect handler when API returns 401 Unauthorized on People Partner query', async ({
      page,
    }) => {
      await setupPeoplePartnerUnauthenticatedDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      await page.waitForURL('**/login')
      expect(page.url()).toContain('/login')
    })
  })

  test.describe('FE-DASH-20 · Grouping dimension boundary on People Partner preset', () => {
    test('grouping dimension control displays People grouping as active on People Partner preset', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))
      const peopleGrouping = ppPanel.locator('[data-grouping="people"]')

      await expect(peopleGrouping).toBeVisible()
      await expect(peopleGrouping).toHaveAttribute('aria-pressed', 'true')
    })

    test('department grouping and project grouping are absent from interactive Story 2.3 grouping controls', async ({
      page,
    }) => {
      await setupPopulatedPeoplePartnerDashboard(page)
      await page.goto('/dashboards')

      const ppTab = page.getByRole('tab', { name: /People Partner/i })
      await expect(ppTab).toBeVisible()
      await ppTab.click()

      const ppPanel = page.locator('#preset-panel-people-partner').or(page.getByRole('tabpanel'))

      // Department & Project groupings are completely absent from PP controls
      await expect(ppPanel.getByRole('button', { name: /Department/i })).toHaveCount(0)
      await expect(ppPanel.getByRole('button', { name: /Project/i })).toHaveCount(0)
      await expect(ppPanel.locator('[data-grouping="department"]')).toHaveCount(0)
      await expect(ppPanel.locator('[data-grouping="project"]')).toHaveCount(0)

      // No mock department tree rendered in PP panel
      await expect(ppPanel.locator('.dept-tree, [data-dept-tree]')).toHaveCount(0)
    })
  })
})



