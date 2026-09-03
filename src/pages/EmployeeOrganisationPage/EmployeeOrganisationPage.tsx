import { Link } from 'react-router-dom'
import { ArrowLeft, UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StatePanel } from '@/components/StatePanel/StatePanel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { fullName, getInitials } from '@/lib/employeeFormatters'
import { useEmployeeOrganisationPage } from './hooks/useEmployeeOrganisationPage'
import { AccessJournal } from './components/AccessJournal/AccessJournal'
import { ManagerSection } from './components/ManagerSection/ManagerSection'
import { PeoplePartnerSection } from './components/PeoplePartnerSection/PeoplePartnerSection'

export const EmployeeOrganisationPage = () => {
  const { t } = useTranslation()
  const {
    routeId,
    backToProfile,
    subject,
    notFound,
    journalStatus,
    rows,
    derivedManager,
    derivedPeoplePartner,
    refetchJournal,
    canWrite,
    reportWriteForbidden,
  } = useEmployeeOrganisationPage()

  return (
    <div className="space-y-6">
      <div className="border-t-[length:var(--page-band-tick)] border-t-primary border-b border-b-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-[0.7rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            {t('organisation.eyebrow')}
          </p>
          <span className="inline-flex items-center gap-1.5 border-l-2 border-provenance-platform pl-1.5 font-mono text-[0.65rem] font-medium tracking-[0.06em] text-provenance-platform uppercase">
            {t('organisation.provenanceTag')}
          </span>
        </div>
        <Link
          to={backToProfile}
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          data-testid="organisation-back-link"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('organisation.backToProfile')}
        </Link>
      </div>

      {notFound ? (
        <StatePanel
          icon={UserX}
          title={t('organisation.notFound.title')}
          body={t('organisation.notFound.body')}
          link={{ label: t('organisation.notFound.backToDirectory'), to: '/employees' }}
          testId="organisation-not-found"
        />
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="size-12">
              {subject?.photo ? <AvatarImage src={subject.photo} alt="" /> : null}
              <AvatarFallback className="font-semibold">
                {subject
                  ? getInitials(subject.firstName, subject.lastName)
                  : routeId.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1
                className="truncate text-lg font-semibold text-foreground"
                data-testid="organisation-subject-name"
              >
                {subject ? fullName(subject) : routeId}
              </h1>
              {subject?.position ? (
                <p className="truncate text-sm text-muted-foreground">{subject.position}</p>
              ) : (
                <p className="text-sm text-muted-foreground">{t('organisation.subjectFallback')}</p>
              )}
            </div>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">{t('organisation.lead')}</p>

          <ManagerSection
            routeId={routeId}
            canWrite={canWrite}
            derived={derivedManager}
            onWriteForbidden={reportWriteForbidden}
          />
          <PeoplePartnerSection
            routeId={routeId}
            canWrite={canWrite}
            derived={derivedPeoplePartner}
            onWriteForbidden={reportWriteForbidden}
          />
          <AccessJournal status={journalStatus} rows={rows} onRetry={refetchJournal} />
        </>
      )}
    </div>
  )
}
