import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft, TriangleAlert, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StateMessage } from '@/components/StateMessage/StateMessage'
import { ProfileHeader } from './components/ProfileHeader/ProfileHeader'
import { ProfileSections } from './components/ProfileSections/ProfileSections'
import { RelationshipsCard } from './components/RelationshipsCard/RelationshipsCard'
import { RecordDepartureDialog } from './components/RecordDepartureDialog/RecordDepartureDialog'
import { usePersonProfile } from './hooks/usePersonProfile'
import { useAuth } from '@/contexts/AuthContext'

export const PersonProfilePage = () => {
  const { t } = useTranslation()
  const { me } = useAuth()
  const { id, profile, isSelf, mentor, can, isLoading, isNotFound, isError, refetch } =
    usePersonProfile()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (isNotFound || !profile) {
    return (
      <StateMessage
        icon={UserX}
        title={t('profile.notFoundTitle')}
        description={t('profile.notFoundBody')}
        action={
          <Button asChild variant="outline">
            <Link to="/people">{t('profile.backToDirectory')}</Link>
          </Button>
        }
      />
    )
  }

  if (isError) {
    return (
      <StateMessage
        icon={TriangleAlert}
        title={t('profile.sectionError')}
        action={
          <Button variant="outline" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        }
      />
    )
  }

  const canChangeRelationships = can('change organisational relationships')
  const canRecordDeparture = can('record a departure')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/people">
            <ArrowLeft className="h-4 w-4" />
            {t('profile.backToDirectory')}
          </Link>
        </Button>
        {canRecordDeparture && profile.employmentStatus === 'active' && (
          <RecordDepartureDialog id={id} />
        )}
      </div>

      <ProfileHeader id={id} profile={profile} mentor={mentor} isSelf={isSelf} />

      {canChangeRelationships && me && (
        <RelationshipsCard id={id} profile={profile} currentUserId={me.id} />
      )}

      <ProfileSections id={id} profile={profile} isSelf={isSelf} />
    </div>
  )
}
