import { useDashboardQuery } from '@/api/hooks/useDashboardQuery'
import { PageHeaderBand } from './components/PageHeaderBand'
import { PresetTabStrip } from './components/PresetTabStrip'
import { HeadcountWidget } from './components/HeadcountWidget'
import { NavigationShortcuts } from './components/NavigationShortcuts'
import { PeopleTableWidget } from './components/PeopleTableWidget'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { AccessDeniedPanel } from './components/AccessDeniedPanel'

export const DashboardsPage = () => {
  const { data, isLoading, isError, error } = useDashboardQuery('unit-manager')

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError || !data) {
    const err = error as { status?: number; statusCode?: number; message?: string }
    const isUnauthenticated =
      err?.status === 401 ||
      err?.statusCode === 401 ||
      err?.message?.includes('401') ||
      err?.message?.includes('Unauthorized')

    if (isUnauthenticated) {
      return null
    }

    return (
      <div className="space-y-6">
        <PageHeaderBand />
        <AccessDeniedPanel />
      </div>
    )
  }

  return (
    <div className="space-y-6" id="preset-panel-unit-manager" role="tabpanel">
      <PageHeaderBand header={data.header} />
      <PresetTabStrip />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HeadcountWidget headcount={data.headcount} />
        <div className="md:col-span-2">
          <NavigationShortcuts navigation={data.navigation} />
        </div>
      </div>

      <PeopleTableWidget peopleTable={data.peopleTable} />
    </div>
  )
}
