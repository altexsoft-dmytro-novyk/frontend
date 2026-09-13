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


