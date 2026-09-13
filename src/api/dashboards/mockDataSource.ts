/**
 * MockDashboardDataSource provides local/mock dashboard data fulfilling IDashboardDataSource.
 *
 * All dev/test scenario override reading (e.g. from sessionStorage) is strictly isolated
 * inside this mock adapter and active only during dev/test mode.
 */

import type {
  IDashboardDataSource,
  UnitManagerDashboardReadModel,
  PeoplePartnerDashboardReadModel,
} from '@/types/dashboards'
import {
  defaultUnitManagerDashboard,
  defaultZeroHeadcountUnitManagerDashboard,
  defaultOmittedColumnsUnitManagerDashboard,
} from './fixtures'

export class MockDashboardDataSource implements IDashboardDataSource {
  async getUnitManagerDashboard(): Promise<UnitManagerDashboardReadModel> {
    const isDevOrTest = import.meta.env.DEV || import.meta.env.MODE === 'test'

    // Restrict dev/test scenario overrides from sessionStorage strictly to dev/test mode
    if (
      isDevOrTest &&
      typeof window !== 'undefined' &&
      typeof window.sessionStorage !== 'undefined'
    ) {
      const scenario = window.sessionStorage.getItem('dashboard:scenario')

      if (scenario === 'loading') {
        // Return a pending promise that never resolves for testing skeleton states
        return new Promise<UnitManagerDashboardReadModel>(() => {})
      }

      if (scenario === 'forbidden') {
        const error = new Error('Access denied: You do not have permission to view this dashboard.')
        ;(error as unknown as { status: number; statusCode: number }).status = 403
        ;(error as unknown as { status: number; statusCode: number }).statusCode = 403
        throw error
      }

      if (scenario === 'unauthenticated') {
        const error = new Error('401 Unauthorized: Session is missing or expired.')
        ;(error as unknown as { status: number; statusCode: number }).status = 401
        ;(error as unknown as { status: number; statusCode: number }).statusCode = 401
        throw error
      }

      const mockDataRaw = window.sessionStorage.getItem('dashboard:mock-data')
      if (mockDataRaw) {
        try {
          return JSON.parse(mockDataRaw) as UnitManagerDashboardReadModel
        } catch {
          // fallback to standard mocks
        }
      }

      if (scenario === 'zero-headcount') {
        return defaultZeroHeadcountUnitManagerDashboard
      }

      if (scenario === 'omitted-columns') {
        return defaultOmittedColumnsUnitManagerDashboard
      }
    }

    return defaultUnitManagerDashboard
  }

  async getPeoplePartnerDashboard(): Promise<PeoplePartnerDashboardReadModel> {
    throw new Error('People Partner dashboard is not implemented in Story 2.1 scope.')
  }
}
