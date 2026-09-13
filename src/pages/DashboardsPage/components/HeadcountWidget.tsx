import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AvailableWidgetState } from '@/types/dashboards'
import { WidgetScopeFooter } from './WidgetScopeFooter'

interface HeadcountWidgetProps {
  headcount: AvailableWidgetState<{
    count: number
    wscope: 'SCOPE: REPORTING_LINE'
  }>
}

export const HeadcountWidget = ({ headcount }: HeadcountWidgetProps) => {
  const { t } = useTranslation()

  return (
    <div
      data-testid="dashboard-headcount-widget"
      data-widget="headcount"
      className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs"
    >
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t('dashboards.headcount.title')}
          </h3>
          <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="mt-3">
          <span className="data-stat text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            {headcount.data.count}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t('dashboards.headcount.subtitle')}
        </p>
      </div>

      <WidgetScopeFooter wscope={headcount.data.wscope} />
    </div>
  )
}
