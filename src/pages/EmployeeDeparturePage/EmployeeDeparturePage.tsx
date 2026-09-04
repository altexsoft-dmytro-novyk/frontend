import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { fullName, getInitials } from '@/lib/employeeFormatters'
import { useEmployeeDeparturePage } from './hooks/useEmployeeDeparturePage'
import { DepartureForm } from './components/DepartureForm/DepartureForm'
import { BlockerPanel } from './components/BlockerPanel/BlockerPanel'
import { DepartureStatus } from './components/DepartureStatus/DepartureStatus'

export const EmployeeDeparturePage = () => {
  const { t } = useTranslation()
  const {
    routeId,
    backToProfile,
    subject,
    subjectLoading,
    departureId,
    phase,
    blocked,
    canWrite,
    reportWriteForbidden,
    idempotencyKeyFor,
    handleRecorded,
    handleBlocked,
    backToForm,
  } = useEmployeeDeparturePage()

  // Move focus to the active phase's heading on a form → blocked → status
  // transition so keyboard / screen-reader users don't lose their place.
  useEffect(() => {
    document.getElementById('departure-phase-heading')?.focus()
  }, [phase])

  const subjectName = subject ? fullName(subject) : t('departure.subjectHeaderFallback')

  return (
    <div className="space-y-6">
      <div className="border-t-[length:var(--page-band-tick)] border-t-primary border-b border-b-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-[0.7rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            {t('departure.eyebrow')}
          </p>
          <span className="inline-flex items-center gap-1.5 border-l-2 border-provenance-platform pl-1.5 font-mono text-[0.65rem] font-medium tracking-[0.06em] text-provenance-platform uppercase">
            {t('departure.provenanceTag')}
          </span>
        </div>
        <Link
          to={backToProfile}
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          data-testid="departure-back-link"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {t('departure.backToProfile')}
        </Link>
      </div>

      {subjectLoading ? (
        <div className="flex items-center gap-3" data-testid="departure-subject-loading">
          <Skeleton className="size-12 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="size-12">
            {subject?.photo ? <AvatarImage src={subject.photo} alt={subjectName} /> : null}
            <AvatarFallback className="font-semibold">
              {subject ? getInitials(subject.firstName, subject.lastName) : '—'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1
              className="truncate text-lg font-semibold text-foreground"
              data-testid="departure-subject-name"
            >
              {subjectName}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {subject?.position ?? t('departure.subjectFallback')}
            </p>
          </div>
        </div>
      )}

      <p className="max-w-2xl text-sm text-muted-foreground">{t('departure.lead')}</p>

      {phase === 'status' && departureId ? (
        <DepartureStatus
          routeId={routeId}
          departureId={departureId}
          backToProfile={backToProfile}
          onBackToForm={backToForm}
        />
      ) : phase === 'blocked' && blocked ? (
        <BlockerPanel
          routeId={routeId}
          response={blocked.response}
          payload={blocked.payload}
          canWrite={canWrite}
          onWriteForbidden={reportWriteForbidden}
          onRecorded={handleRecorded}
          onBlocked={handleBlocked}
          onBackToForm={backToForm}
          idempotencyKeyFor={idempotencyKeyFor}
        />
      ) : (
        <DepartureForm
          routeId={routeId}
          subjectName={subjectName}
          canWrite={canWrite}
          onWriteForbidden={reportWriteForbidden}
          onRecorded={handleRecorded}
          onBlocked={handleBlocked}
          idempotencyKeyFor={idempotencyKeyFor}
        />
      )}
    </div>
  )
}
