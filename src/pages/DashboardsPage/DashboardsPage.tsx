import { useState } from 'react'
import {
  AlertTriangle,
  ListTodo,
  CheckSquare,
  Briefcase,
  Megaphone,
  Award,
  FileText,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDashboardQuery } from '@/api/hooks/useDashboardQuery'
import type {
  DashboardPreset,
  UnitManagerDashboardReadModel,
  PeoplePartnerDashboardReadModel,
  AvailableWidgetState,
  UnavailableWidgetState,
} from '@/types/dashboards'
import { PageHeaderBand } from './components/PageHeaderBand'
import { PresetTabStrip } from './components/PresetTabStrip'
import { HeadcountWidget } from './components/HeadcountWidget'
import { NavigationShortcuts } from './components/NavigationShortcuts'
import { UnavailableWidgetCard } from './components/UnavailableWidgetCard'
import { IncompleteProfilesWidget } from './components/IncompleteProfilesWidget'
import { PeopleTableWidget } from './components/PeopleTableWidget'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { AccessDeniedPanel } from './components/AccessDeniedPanel'

export const DashboardsPage = () => {
  const { t } = useTranslation()
  const [activePreset, setActivePreset] = useState<DashboardPreset>('unit-manager')
  const { data, isLoading, isError, error } = useDashboardQuery(activePreset)

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError || !data) {
    const err = error as {
      status?: number
      statusCode?: number
      message?: string
      response?: { status?: number }
    }
    const isUnauthenticated =
      err?.status === 401 ||
      err?.statusCode === 401 ||
      err?.response?.status === 401 ||
      err?.message?.includes('401') ||
      err?.message?.includes('Unauthorized')

    if (isUnauthenticated) {
      return null
    }

    return (
      <div className="space-y-6">
        <PageHeaderBand />
        <PresetTabStrip activePreset={activePreset} onSelectPreset={setActivePreset} />
        <AccessDeniedPanel />
      </div>
    )
  }

  const isUnitManager = activePreset === 'unit-manager'
  const isPeoplePartner = activePreset === 'people-partner'

  return (
    <div
      className="space-y-6"
      id={isUnitManager ? 'preset-panel-unit-manager' : 'preset-panel-people-partner'}
      role="tabpanel"
      aria-labelledby={isUnitManager ? 'preset-tab-unit-manager' : 'preset-tab-people-partner'}
    >
      <PageHeaderBand
        header={data.header}
        title={isPeoplePartner ? t('dashboards.ppTitle') : t('dashboards.title')}
        lead={isPeoplePartner ? t('dashboards.ppLead') : t('dashboards.lead')}
      />
      <PresetTabStrip activePreset={activePreset} onSelectPreset={setActivePreset} />

      {isUnitManager && (
        <>
          {(() => {
            const umData = data as UnitManagerDashboardReadModel
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <HeadcountWidget headcount={umData.headcount} />
                  <div className="md:col-span-2">
                    <NavigationShortcuts navigation={umData.navigation} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <UnavailableWidgetCard
                    slot="riskCounts"
                    state={umData.widgets.riskCounts}
                    icon={AlertTriangle}
                  />
                  <UnavailableWidgetCard
                    slot="unitActionItems"
                    state={umData.widgets.unitActionItems}
                    icon={ListTodo}
                  />
                  <UnavailableWidgetCard
                    slot="myActionItems"
                    state={umData.widgets.myActionItems}
                    icon={CheckSquare}
                  />
                  <UnavailableWidgetCard
                    slot="resourcingRequests"
                    state={umData.widgets.resourcingRequests}
                    icon={Briefcase}
                  />
                  <UnavailableWidgetCard
                    slot="openCampaigns"
                    state={umData.widgets.openCampaigns}
                    icon={Megaphone}
                  />
                </div>

                <PeopleTableWidget peopleTable={umData.peopleTable} />
              </>
            )
          })()}
        </>
      )}

      {isPeoplePartner && (
        <>
          {(() => {
            const ppData = data as PeoplePartnerDashboardReadModel
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <HeadcountWidget headcount={ppData.headcount} />
                  <div className="md:col-span-2">
                    <NavigationShortcuts navigation={ppData.navigation} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ppData.widgets.incompleteProfiles.status === 'available' ? (
                    <IncompleteProfilesWidget
                      incompleteProfiles={
                        ppData.widgets.incompleteProfiles as AvailableWidgetState<{
                          count: number
                          wscope: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT'
                        }>
                      }
                    />
                  ) : (
                    <UnavailableWidgetCard
                      slot="incompleteProfiles"
                      state={ppData.widgets.incompleteProfiles as UnavailableWidgetState}
                      icon={FileText}
                    />
                  )}
                  <UnavailableWidgetCard
                    slot="riskCounts"
                    state={ppData.widgets.riskCounts}
                    icon={AlertTriangle}
                  />
                  <UnavailableWidgetCard
                    slot="assignedActionItems"
                    state={ppData.widgets.assignedActionItems}
                    icon={ListTodo}
                  />
                  <UnavailableWidgetCard
                    slot="cdsMilestones"
                    state={ppData.widgets.cdsMilestones}
                    icon={Award}
                  />
                  <UnavailableWidgetCard
                    slot="campaignCompletion"
                    state={ppData.widgets.campaignCompletion}
                    icon={Megaphone}
                  />
                </div>

                <PeopleTableWidget peopleTable={ppData.peopleTable} />
              </>
            )
          })()}
        </>
      )}
    </div>
  )
}
