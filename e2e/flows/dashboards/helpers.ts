import type { Page } from '@playwright/test'
import {
  mockPopulatedUnitManagerDashboard,
  mockZeroHeadcountUnitManagerDashboard,
  mockOmittedColumnsUnitManagerDashboard,
  type UnitManagerDashboardReadModel,
} from './fixtures'

/**
 * Storage keys used by IDashboardDataSource mock adapter in development/test mode.
 * Standard Web Storage API (sessionStorage) is scoped per-tab and isolated between tests.
 */
export const DASHBOARD_STORAGE_KEYS = {
  SCENARIO: 'dashboard:scenario',
  MOCK_DATA: 'dashboard:mock-data',
} as const

export type DashboardTestScenario =
  | 'populated'
  | 'loading'
  | 'zero-headcount'
  | 'omitted-columns'
  | 'forbidden'
  | 'unauthenticated'

/**
 * Test setup helpers for People Management Dashboards E2E tests.
 *
 * ARCHITECTURAL TEST BOUNDARY & SEAM CONTRACT:
 * - OQ-DASH-ROUTE-01 (REST routes) and OQ-DASH-DTO-01 (HTTP wire serialization) remain UNRESOLVED.
 * - These helpers do NOT register hardcoded HTTP route interceptions (e.g. '/api/dashboards' or '/dashboards/unit-manager')
 *   and do NOT fulfill network requests with serialized JSON envelopes.
 * - These helpers do NOT force a global window backdoor into production code.
 * - In accordance with SPEC.md and dashboard-api-contract.md, IDashboardDataSource is the frontend application boundary.
 * - In test/dev mode, the MockDashboardDataSource reads the scenario and fixture data from standard sessionStorage
 *   initialized before the React application mounts via page.addInitScript().
 * - Document navigation (page.goto('/dashboards')) is never intercepted and loads the application document cleanly.
 */

/** Configures the test scenario for a populated Unit Manager dashboard */
export async function setupPopulatedDashboard(page: Page, data?: Partial<UnitManagerDashboardReadModel>): Promise<void> {
  const payload: UnitManagerDashboardReadModel = {
    ...mockPopulatedUnitManagerDashboard,
    ...data,
  }

  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataKey, scenario, mockData }) => {
      sessionStorage.setItem(scenarioKey, scenario)
      if (mockData) {
        sessionStorage.setItem(dataKey, JSON.stringify(mockData))
      } else {
        sessionStorage.removeItem(dataKey)
      }
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA,
      scenario: 'populated' as DashboardTestScenario,
      mockData: data ? payload : null,
    }
  )
}

/** Configures the test scenario for a pending/loading dashboard */
export async function setupLoadingDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataKey, scenario }) => {
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.removeItem(dataKey)
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA,
      scenario: 'loading' as DashboardTestScenario,
    }
  )
}

/** Configures the test scenario for a legitimate zero-headcount / empty-scope dashboard */
export async function setupZeroHeadcountDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataKey, scenario, mockData }) => {
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.setItem(dataKey, JSON.stringify(mockData))
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA,
      scenario: 'zero-headcount' as DashboardTestScenario,
      mockData: mockZeroHeadcountUnitManagerDashboard,
    }
  )
}

/** Configures the test scenario with omitted uncovered columns */
export async function setupOmittedColumnsDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataKey, scenario, mockData }) => {
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.setItem(dataKey, JSON.stringify(mockData))
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA,
      scenario: 'omitted-columns' as DashboardTestScenario,
      mockData: mockOmittedColumnsUnitManagerDashboard,
    }
  )
}

/** Configures the test scenario for 403 Forbidden access denial */
export async function setupAccessDeniedDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataKey, scenario }) => {
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.removeItem(dataKey)
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA,
      scenario: 'forbidden' as DashboardTestScenario,
    }
  )
}

/** Configures the test scenario for 401 Unauthorized / unauthenticated state */
export async function setupUnauthenticatedDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataKey, scenario }) => {
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.removeItem(dataKey)
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA,
      scenario: 'unauthenticated' as DashboardTestScenario,
    }
  )
}
