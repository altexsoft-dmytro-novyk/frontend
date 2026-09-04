import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { DASH, formatBirthday, formatIsoDate } from '@/lib/employeeFormatters'
import type { S1IdentityCard } from '@/types/api'
import { IdentityCardForm } from './IdentityCardForm'

interface IdentityCardProps {
  card: S1IdentityCard
  canEdit: boolean
}

const Row = ({ label, value }: { label: string; value: string | null }) => (
  <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:gap-4">
    <span className="text-sm text-muted-foreground sm:w-44 sm:shrink-0">{label}</span>
    {value ? (
      <span className="text-sm text-foreground">{value}</span>
    ) : (
      <span className="text-sm text-muted-foreground">{DASH}</span>
    )}
  </div>
)

export const IdentityCard = ({ card, canEdit }: IdentityCardProps) => {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <section
      className="rounded-lg border border-border bg-card p-4 sm:p-5"
      data-testid="profile-identity-card"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{t('profile.card.title')}</h2>
        {canEdit && !isEditing ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            data-testid="profile-edit-button"
          >
            <Pencil className="h-3.5 w-3.5" />
            {t('profile.card.edit')}
          </Button>
        ) : null}
      </div>

      {isEditing ? (
        <IdentityCardForm
          // Remount if the underlying record changes under a background refetch,
          // so the form never keeps editing stale defaults.
          key={`${card.id}:${card.workEmail}:${card.position}:${card.companyJoinDate}`}
          card={card}
          onDone={() => setIsEditing(false)}
        />
      ) : (
        <div className="mt-3 divide-y divide-border">
          <Row label={t('profile.card.fields.firstName')} value={card.firstName} />
          <Row label={t('profile.card.fields.lastName')} value={card.lastName} />
          <Row label={t('profile.card.fields.position')} value={card.position} />
          <Row label={t('profile.card.fields.country')} value={card.country} />
          <Row label={t('profile.card.fields.city')} value={card.city} />
          <Row label={t('profile.card.fields.workEmail')} value={card.workEmail} />
          <Row label={t('profile.card.fields.workPhone')} value={card.workPhone} />
          <Row
            label={t('profile.card.fields.birthday')}
            value={formatBirthday(card.birthDay, card.birthMonth)}
          />
          <Row
            label={t('profile.card.fields.companyJoinDate')}
            value={formatIsoDate(card.companyJoinDate)}
          />
          <Row label={t('profile.card.fields.employeeId')} value={card.id} />
        </div>
      )}
    </section>
  )
}
