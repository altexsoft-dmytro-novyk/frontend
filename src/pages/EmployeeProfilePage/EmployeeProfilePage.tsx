import { Link } from 'react-router-dom'
import { ArrowLeft, TriangleAlert, UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StatePanel } from '@/components/StatePanel/StatePanel'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmployeeProfilePage } from './hooks/useEmployeeProfilePage'
import { ProfileHeader } from './components/ProfileHeader/ProfileHeader'
import { IdentityCard } from './components/IdentityCard/IdentityCard'
import { CareerTimeline } from './components/CareerTimeline/CareerTimeline'

export const EmployeeProfilePage = () => {
  const { t } = useTranslation()
  const { routeId, isOwnProfile, status, card, canEdit, refetch } = useEmployeeProfilePage()

  return (
    <div className="space-y-6">
      <div className="border-t-[length:var(--page-band-tick)] border-t-primary border-b border-b-border pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-[0.7rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            {t('profile.eyebrow')}
          </p>
          <span className="inline-flex items-center gap-1.5 border-l-2 border-provenance-platform pl-1.5 font-mono text-[0.65rem] font-medium tracking-[0.06em] text-provenance-platform uppercase">
            {t('profile.provenanceTag')}
          </span>
        </div>
        <Link
          to="/employees"
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          data-testid="profile-back-link"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('profile.backToDirectory')}
        </Link>
      </div>

      {status === 'loading' ? (
        <div className="space-y-4" data-testid="profile-loading" role="status" aria-live="polite">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : status === 'unavailable' ? (
        <StatePanel
          icon={UserX}
          title={t('profile.unavailable.title')}
          body={t('profile.unavailable.body')}
          link={{ label: t('profile.unavailable.backToDirectory'), to: '/employees' }}
          testId="profile-unavailable"
        />
      ) : status === 'error' ? (
        <StatePanel
          icon={TriangleAlert}
          title={t('profile.error.title')}
          body={t('profile.error.body')}
          actions={[{ label: t('profile.error.retry'), onClick: refetch }]}
          testId="profile-error"
        />
      ) : card ? (
        <>
          <ProfileHeader card={card} isOwnProfile={isOwnProfile} />
          <IdentityCard card={card} canEdit={canEdit} />
          <CareerTimeline employeeId={routeId} />
        </>
      ) : (
        // `status` already collapses a data-less response to `error`; this is a
        // belt-and-braces guard so a missing card can never blank the screen.
        <StatePanel
          icon={TriangleAlert}
          title={t('profile.error.title')}
          body={t('profile.error.body')}
          actions={[{ label: t('profile.error.retry'), onClick: refetch }]}
          testId="profile-error"
        />
      )}
    </div>
  )
}
