import { useTranslation } from 'react-i18next'
import { LockKeyhole, SearchX, ShieldAlert, SlidersHorizontal, TriangleAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmployeeFilters } from './components/EmployeeFilters/EmployeeFilters'
import { EmployeePager } from './components/EmployeePager/EmployeePager'
import { EmployeeTable } from './components/EmployeeTable/EmployeeTable'
import { EmployeesStatePanel } from './components/EmployeesStatePanel/EmployeesStatePanel'
import { useEmployeesPage } from './hooks/useEmployeesPage'

const SKELETON_ROWS = Array.from({ length: 8 }, (_, index) => index)

export const EmployeesPage = () => {
  const { t } = useTranslation()
  const {
    rows,
    page,
    total,
    totalPages,
    status,
    isFetching,
    filters,
    hasActiveFilters,
    applyFilters,
    clearFilters,
    goToPage,
    refetch,
  } = useEmployeesPage()

  const showFooter = status === 'ready' || status === 'empty'

  const emptyStateActions = [
    ...(page > 1 ? [{ label: t('employees.backToFirstPage'), onClick: () => goToPage(1) }] : []),
    ...(hasActiveFilters ? [{ label: t('employees.clearFilters'), onClick: clearFilters }] : []),
  ]

  return (
    <div className="space-y-6">
      <div className="border-t-[length:var(--page-band-tick)] border-t-primary border-b border-b-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-[0.7rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            {t('employees.eyebrow')}
          </p>
          <span className="inline-flex items-center gap-1.5 border-l-2 border-provenance-access pl-1.5 font-mono text-[0.65rem] font-medium tracking-[0.06em] text-provenance-access uppercase">
            <ShieldAlert className="h-3 w-3" aria-hidden="true" />
            {t('employees.provenanceTag')}
          </span>
        </div>
        <h1 className="mt-2 text-xl font-semibold text-foreground" data-testid="employees-title">
          {t('employees.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('employees.lead')}</p>
      </div>

      {status === 'forbidden' ? (
        <EmployeesStatePanel
          icon={LockKeyhole}
          title={t('employees.forbidden.title')}
          body={t('employees.forbidden.body')}
          testId="employees-forbidden"
        />
      ) : (
        <>
          <EmployeeFilters
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            onApply={applyFilters}
            onClear={clearFilters}
          />

          {status === 'badRequest' ? (
            <EmployeesStatePanel
              icon={SlidersHorizontal}
              title={t('employees.badRequest.title')}
              body={t('employees.badRequest.body')}
              actions={[{ label: t('employees.clearFilters'), onClick: clearFilters }]}
              testId="employees-badrequest"
            />
          ) : status === 'error' ? (
            <EmployeesStatePanel
              icon={TriangleAlert}
              title={t('employees.error.title')}
              body={t('employees.error.body')}
              actions={[
                {
                  label: t('employees.error.retry'),
                  onClick: () => {
                    void refetch()
                  },
                },
              ]}
              testId="employees-error"
            />
          ) : (
            <div className="rounded-lg border border-border bg-card">
              {status === 'loading' ? (
                <div
                  className="space-y-3 p-4"
                  data-testid="employees-loading"
                  role="status"
                  aria-live="polite"
                  aria-label={t('employees.loading')}
                >
                  {SKELETON_ROWS.map(row => (
                    <Skeleton key={row} className="h-9 w-full" />
                  ))}
                </div>
              ) : status === 'empty' ? (
                <EmployeesStatePanel
                  icon={SearchX}
                  title={t('employees.empty.title')}
                  body={t('employees.empty.body')}
                  actions={emptyStateActions}
                  testId="employees-empty"
                />
              ) : (
                <EmployeeTable rows={rows} isStale={isFetching} />
              )}

              {showFooter && (
                <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-mono" data-testid="employees-footer-count">
                    {t('employees.footerCount', { count: total })}
                  </span>
                  <EmployeePager page={page} totalPages={totalPages} onPageChange={goToPage} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
