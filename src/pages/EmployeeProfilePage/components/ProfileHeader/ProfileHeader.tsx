import { ImageUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { fullName, getInitials } from '@/lib/employeeFormatters'
import type { S1IdentityCard } from '@/types/api'
import { useProfilePhotoUpload } from './hooks/useProfilePhotoUpload'

interface ProfileHeaderProps {
  card: S1IdentityCard
  isOwnProfile: boolean
}

export const ProfileHeader = ({ card, isOwnProfile }: ProfileHeaderProps) => {
  const { t } = useTranslation()
  const { fileInputRef, openFilePicker, onFileChange, isUploading, error } = useProfilePhotoUpload(
    card.id
  )

  const location = [card.position, card.city].filter(Boolean).join(' · ')
  const name = fullName(card)

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
      <Avatar size="lg" className="size-16">
        {card.photo ? <AvatarImage src={card.photo} alt={name} /> : null}
        <AvatarFallback className="text-lg font-semibold">
          {getInitials(card.firstName, card.lastName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-semibold text-foreground" data-testid="profile-name">
          {name}
        </h1>
        {location ? <p className="mt-0.5 text-sm text-muted-foreground">{location}</p> : null}
        {card.country ? <p className="text-sm text-muted-foreground">{card.country}</p> : null}
      </div>

      {isOwnProfile ? (
        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            data-testid="profile-photo-input"
            onChange={onFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFilePicker}
            disabled={isUploading}
          >
            <ImageUp className="h-3.5 w-3.5" />
            {isUploading ? t('profile.header.uploading') : t('profile.header.uploadPhoto')}
          </Button>
          {error ? (
            <p className="text-xs text-destructive" role="alert" data-testid="profile-photo-error">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
