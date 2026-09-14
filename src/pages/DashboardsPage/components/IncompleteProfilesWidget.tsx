import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AvailableWidgetState } from '@/types/dashboards'
import { WidgetScopeFooter } from './WidgetScopeFooter'

interface IncompleteProfilesWidgetProps {
  incompleteProfiles: AvailableWidgetState<{
    count: number
    wscope: 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT'
  }>
}

export const IncompleteProfilesWidget = ({
  incompleteProfiles,
}: IncompleteProfilesWidgetProps) => {
  const { t } = useTranslation()

  return (
    <div
      data-slot="incompleteProfiles"
      className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs"
    >
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t('dashboards.widgets.incompleteProfiles')}
          </h3>
          <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="mt-3">
          <span className="data-stat text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            {incompleteProfiles.data.count}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t('dashboards.widgets.incompleteProfilesSubtitle')}
        </p>
      </div>

      <WidgetScopeFooter wscope={incompleteProfiles.data.wscope} />
    </div>
  )
}
