import { Users, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AvailableWidgetState, DashboardPersonRow } from '@/types/dashboards'
import { WidgetScopeFooter } from './WidgetScopeFooter'

interface PeopleTableWidgetProps {
  peopleTable: AvailableWidgetState<{
    rows: DashboardPersonRow[]
    totalCount: number
    wscope: 'SCOPE: REPORTING_LINE' | 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT'
  }>
}

export const PeopleTableWidget = ({ peopleTable }: PeopleTableWidgetProps) => {
  const { t } = useTranslation()
  const { rows, totalCount, wscope } = peopleTable.data

  const isPpScope = wscope === 'SCOPE: PEOPLE_PARTNER_ASSIGNMENT'

  // Uncovered capability columns are rendered only if present; otherwise omitted entirely
  const hasProjectColumn = rows.some(r => r.project !== undefined)
  const hasLeaveColumn = rows.some(r => r.leaveStatus !== undefined)
  const hasRiskColumn = rows.some(r => r.riskLevel !== undefined)

  return (
    <section
      data-testid="dashboard-people-table-widget"
      data-widget="people-table"
      data-slot="peopleTable"
      className="rounded-xl border border-border bg-card p-5 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t('dashboards.peopleTable.title')}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isPpScope
              ? t('dashboards.peopleTable.ppSubtitle')
              : t('dashboards.peopleTable.subtitle')}
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-muted-foreground">
          {totalCount} {totalCount === 1 ? 'member' : 'members'}
        </span>
      </div>

      {rows.length === 0 ? (
        <div
          data-testid="dashboard-empty-state"
          data-slot="empty-state"
          className="emptyst flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="rounded-full bg-muted p-3 mb-3">
            <Users className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {isPpScope
              ? t('dashboards.peopleTable.emptyPpTitle')
              : t('dashboards.peopleTable.emptyTitle')}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {isPpScope
              ? t('dashboards.peopleTable.emptyPpDescription')
              : t('dashboards.peopleTable.emptyDescription')}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table
            data-testid="dashboard-people-table"
            role="table"
            className="w-full text-left text-xs"
          >
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th scope="col" className="pb-3 font-medium">
                  {t('dashboards.peopleTable.columns.member')}
                </th>
                <th scope="col" className="pb-3 font-medium">
                  {t('dashboards.peopleTable.columns.position')}
                </th>
                <th scope="col" className="pb-3 font-medium">
                  {t('dashboards.peopleTable.columns.grade')}
                </th>
                <th scope="col" className="pb-3 font-medium">
                  {t('dashboards.peopleTable.columns.employmentType')}
                </th>
                {hasProjectColumn && (
                  <th scope="col" className="pb-3 font-medium">
                    {t('dashboards.peopleTable.columns.project')}
                  </th>
                )}
                {hasLeaveColumn && (
                  <th scope="col" className="pb-3 font-medium">
                    {t('dashboards.peopleTable.columns.leave')}
                  </th>
                )}
                {hasRiskColumn && (
                  <th scope="col" className="pb-3 font-medium">
                    {t('dashboards.peopleTable.columns.risk')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(row => {
                const initials = `${row.firstName?.[0] ?? ''}${row.lastName?.[0] ?? ''}`.toUpperCase()
                return (
                  <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {row.avatarUrl ? (
                          <img
                            src={row.avatarUrl}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-[10px] shrink-0">
                            {initials || '—'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {row.firstName} {row.lastName}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {row.workEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {row.position || '—'}
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-mono font-medium text-foreground">
                        {row.grade || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {row.employmentType || '—'}
                    </td>
                    {hasProjectColumn && (
                      <td className="py-3 px-2">
                        <span
                          data-unavailable="true"
                          className="unavailable-column inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                        >
                          <AlertCircle className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                          <span>{t('dashboards.unavailable')}</span>
                        </span>
                      </td>
                    )}
                    {hasLeaveColumn && (
                      <td className="py-3 px-2">
                        <span
                          data-unavailable="true"
                          className="unavailable-column inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                        >
                          <AlertCircle className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                          <span>{t('dashboards.unavailable')}</span>
                        </span>
                      </td>
                    )}
                    {hasRiskColumn && (
                      <td className="py-3 px-2">
                        <span
                          data-unavailable="true"
                          className="unavailable-column inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                        >
                          <AlertCircle className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                          <span>{t('dashboards.unavailable')}</span>
                        </span>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <WidgetScopeFooter wscope={wscope} />
    </section>
  )
}
