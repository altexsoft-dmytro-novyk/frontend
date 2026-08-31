import { useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/UserAvatar/UserAvatar'
import { EmploymentStatusBadge } from '@/components/EmploymentStatusBadge/EmploymentStatusBadge'
import { useUploadPhoto } from '@/api/hooks/useUsers'
import type { PersonRef, UserProfile } from '@/types/domain'

interface ProfileHeaderProps {
  id: string
  profile: UserProfile
  mentor: PersonRef | null
  isSelf: boolean
}

const ACCEPTED_PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_PHOTO_BYTES = 5 * 1024 * 1024

const RelationLink = ({
  label,
  person,
}: {
  label: string
  person: PersonRef | null | undefined
}) => (
  <div className="text-sm">
    <span className="text-muted-foreground">{label}: </span>
    {person ? (
      <Link to={`/people/${person.id}`} className="font-medium text-foreground hover:underline">
        {person.name}
      </Link>
    ) : (
      <span className="text-muted-foreground">—</span>
    )}
  </div>
)

export const ProfileHeader = ({ id, profile, mentor, isSelf }: ProfileHeaderProps) => {
  const { t } = useTranslation()
  const uploadPhoto = useUploadPhoto(id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoPicked = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type) || file.size > MAX_PHOTO_BYTES) {
      toast.error(t('profile.header.photoError'))
      return
    }
    uploadPhoto.mutate(file, {
      onSuccess: () => toast.success(t('profile.header.photoUpdated')),
      onError: () => toast.error(t('profile.header.photoError')),
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-start">
      <div className="relative">
        <UserAvatar
          firstName={profile.firstName}
          lastName={profile.lastName}
          photo={profile.photo}
          className="h-20 w-20 text-xl"
        />
        {isSelf && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_PHOTO_TYPES.join(',')}
              className="hidden"
              onChange={handlePhotoPicked}
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
              aria-label={t('profile.header.changePhoto')}
              disabled={uploadPhoto.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadPhoto.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
            </Button>
          </>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">
            {profile.firstName} {profile.lastName}
          </h1>
          {isSelf && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {t('profile.you')}
            </span>
          )}
          <EmploymentStatusBadge status={profile.employmentStatus} />
        </div>
        <p className="text-sm text-muted-foreground">{profile.position}</p>

        <div className="grid gap-1 pt-1 sm:grid-cols-2">
          {profile.department && (
            <RelationLink label={t('profile.header.department')} person={profile.department} />
          )}
          <RelationLink label={t('profile.header.manager')} person={profile.manager} />
          <RelationLink label={t('profile.header.peoplePartner')} person={profile.peoplePartner} />
          <RelationLink label={t('profile.header.mentor')} person={mentor} />
        </div>
      </div>
    </div>
  )
}
