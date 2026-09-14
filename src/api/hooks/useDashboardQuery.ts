/**
 * TanStack Query hook for People Management Dashboards.
 * Conforms to dashboard-api-contract.md §9.1.
 */

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type {
  DashboardPreset,
  IDashboardDataSource,
  UnitManagerDashboardReadModel,
  PeoplePartnerDashboardReadModel,
} from '@/types/dashboards'
import { defaultDashboardDataSource } from '@/api/dashboards/dataSource'
import { clearSession } from '@/lib/session'

export interface UseDashboardQueryOptions {
  actorUserId?: string
  dataSource?: IDashboardDataSource
}

export function useDashboardQuery<T extends DashboardPreset>(
  preset: T,
  options?: UseDashboardQueryOptions
) {
  const actorUserId = options?.actorUserId ?? 'current-user'
  const dataSource = options?.dataSource ?? defaultDashboardDataSource

  const query = useQuery<
    T extends 'unit-manager'
      ? UnitManagerDashboardReadModel
      : PeoplePartnerDashboardReadModel
  >({
    queryKey: ['dashboards', actorUserId, preset],
    queryFn: async () => {
      if (preset === 'unit-manager') {
        const result = await dataSource.getUnitManagerDashboard()
        return result as T extends 'unit-manager'
          ? UnitManagerDashboardReadModel
          : PeoplePartnerDashboardReadModel
      }
      const result = await dataSource.getPeoplePartnerDashboard()
      return result as T extends 'unit-manager'
        ? UnitManagerDashboardReadModel
        : PeoplePartnerDashboardReadModel
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  })

  // Global unauthenticated (401) redirect handling
  useEffect(() => {
    if (query.isError && query.error) {
      const err = query.error as {
        status?: number
        statusCode?: number
        message?: string
        response?: { status?: number }
      }
      if (
        err.status === 401 ||
        err.statusCode === 401 ||
        err.response?.status === 401 ||
        err.message?.includes('401') ||
        err.message?.includes('Unauthorized')
      ) {
        clearSession()
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.assign('/login')
        }
      }
    }
  }, [query.isError, query.error])

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
