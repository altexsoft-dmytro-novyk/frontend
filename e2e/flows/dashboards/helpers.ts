import type { Page } from '@playwright/test'
import {
  mockPopulatedUnitManagerDashboard,
  mockZeroHeadcountUnitManagerDashboard,
  mockOmittedColumnsUnitManagerDashboard,
  mockPopulatedPeoplePartnerDashboard,
  mockZeroHeadcountPeoplePartnerDashboard,
  mockUnavailableIncompleteProfilesPeoplePartnerDashboard,
  type UnitManagerDashboardReadModel,
  type PeoplePartnerDashboardReadModel,
  SESSION_STORAGE_KEY,
  SEEDED_SESSION_JWT,
} from './fixtures'

/**
 * Storage keys used by IDashboardDataSource mock adapter in development/test mode.
 * Standard Web Storage API (sessionStorage) is scoped per-tab and isolated between tests.
 */
export const DASHBOARD_STORAGE_KEYS = {
  SCENARIO: 'dashboard:scenario',
  MOCK_DATA: 'dashboard:mock-data',
  MOCK_DATA_PP: 'dashboard:mock-data-pp',
} as const

export type DashboardTestScenario =
  | 'populated'
  | 'loading'
  | 'loading-pp'
  | 'zero-headcount'
  | 'omitted-columns'
  | 'forbidden'
  | 'forbidden-pp'
  | 'unauthenticated'
  | 'unauthenticated-pp'

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
    ({ scenarioKey, dataKey, scenario, mockData, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
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
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}

/** Configures the test scenario for a pending/loading dashboard */
export async function setupLoadingDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataKey, scenario, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.removeItem(dataKey)
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA,
      scenario: 'loading' as DashboardTestScenario,
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}

/** Configures the test scenario for a legitimate zero-headcount / empty-scope dashboard */
export async function setupZeroHeadcountDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataKey, scenario, mockData, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.setItem(dataKey, JSON.stringify(mockData))
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA,
      scenario: 'zero-headcount' as DashboardTestScenario,
      mockData: mockZeroHeadcountUnitManagerDashboard,
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}

/** Configures the test scenario with omitted uncovered columns */
export async function setupOmittedColumnsDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataKey, scenario, mockData, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.setItem(dataKey, JSON.stringify(mockData))
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA,
      scenario: 'omitted-columns' as DashboardTestScenario,
      mockData: mockOmittedColumnsUnitManagerDashboard,
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}

/** Configures the test scenario for 403 Forbidden access denial */
export async function setupAccessDeniedDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataKey, scenario, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.removeItem(dataKey)
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA,
      scenario: 'forbidden' as DashboardTestScenario,
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}

/** Configures the test scenario for 401 Unauthorized / unauthenticated state */
export async function setupUnauthenticatedDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataKey, scenario, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.removeItem(dataKey)
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA,
      scenario: 'unauthenticated' as DashboardTestScenario,
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}

/** Configures the test scenario for a populated People Partner dashboard */
export async function setupPopulatedPeoplePartnerDashboard(
  page: Page,
  data?: Partial<PeoplePartnerDashboardReadModel>
): Promise<void> {
  const payload: PeoplePartnerDashboardReadModel = {
    ...mockPopulatedPeoplePartnerDashboard,
    ...data,
  }

  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataPpKey, scenario, mockData, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.setItem(dataPpKey, JSON.stringify(mockData))
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataPpKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA_PP,
      scenario: 'populated' as DashboardTestScenario,
      mockData: payload,
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}

/** Configures the test scenario for a legitimate zero-headcount People Partner dashboard */
export async function setupZeroHeadcountPeoplePartnerDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataPpKey, scenario, mockData, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.setItem(dataPpKey, JSON.stringify(mockData))
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataPpKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA_PP,
      scenario: 'zero-headcount' as DashboardTestScenario,
      mockData: mockZeroHeadcountPeoplePartnerDashboard,
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}

/** Configures the test scenario with unavailable incompleteProfiles HR widget */
export async function setupUnavailableIncompleteProfilesPeoplePartnerDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataPpKey, scenario, mockData, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.setItem(dataPpKey, JSON.stringify(mockData))
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataPpKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA_PP,
      scenario: 'populated' as DashboardTestScenario,
      mockData: mockUnavailableIncompleteProfilesPeoplePartnerDashboard,
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}

/** Configures a dual-preset dashboard scenario enabling both Unit Manager and People Partner data */
export async function setupDualPresetDashboard(
  page: Page,
  options?: {
    umData?: Partial<UnitManagerDashboardReadModel>
    ppData?: Partial<PeoplePartnerDashboardReadModel>
  }
): Promise<void> {
  const umPayload: UnitManagerDashboardReadModel = {
    ...mockPopulatedUnitManagerDashboard,
    ...options?.umData,
  }
  const ppPayload: PeoplePartnerDashboardReadModel = {
    ...mockPopulatedPeoplePartnerDashboard,
    ...options?.ppData,
  }

  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataKey, dataPpKey, scenario, umMockData, ppMockData, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.setItem(dataKey, JSON.stringify(umMockData))
      sessionStorage.setItem(dataPpKey, JSON.stringify(ppMockData))
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA,
      dataPpKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA_PP,
      scenario: 'populated' as DashboardTestScenario,
      umMockData: umPayload,
      ppMockData: ppPayload,
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}

/** Configures the test scenario for a pending/loading People Partner dashboard */
export async function setupPeoplePartnerLoadingDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataPpKey, scenario, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.removeItem(dataPpKey)
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataPpKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA_PP,
      scenario: 'loading-pp' as DashboardTestScenario,
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}

/** Configures the test scenario for 403 Forbidden access denial on People Partner query */
export async function setupPeoplePartnerAccessDeniedDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataPpKey, scenario, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.removeItem(dataPpKey)
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataPpKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA_PP,
      scenario: 'forbidden-pp' as DashboardTestScenario,
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}

/** Configures the test scenario for 401 Unauthorized access on People Partner query */
export async function setupPeoplePartnerUnauthenticatedDashboard(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' })
  await page.addInitScript(
    ({ scenarioKey, dataPpKey, scenario, sessionKey, sessionJwt }) => {
      sessionStorage.setItem(sessionKey, sessionJwt)
      sessionStorage.setItem(scenarioKey, scenario)
      sessionStorage.removeItem(dataPpKey)
    },
    {
      scenarioKey: DASHBOARD_STORAGE_KEYS.SCENARIO,
      dataPpKey: DASHBOARD_STORAGE_KEYS.MOCK_DATA_PP,
      scenario: 'unauthenticated-pp' as DashboardTestScenario,
      sessionKey: SESSION_STORAGE_KEY,
      sessionJwt: SEEDED_SESSION_JWT,
    }
  )
}
