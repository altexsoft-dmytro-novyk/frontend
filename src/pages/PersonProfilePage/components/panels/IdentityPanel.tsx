import { IdCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { usePatchUser } from '@/api/hooks/useUsers'
import { formatDate } from '@/helpers/format'
import { FieldsPanel } from '@/pages/PersonProfilePage/components/FieldsPanel/FieldsPanel'
import type { PatchIdentityBody, UserProfile } from '@/types/domain'

interface IdentityPanelProps {
  id: string
  profile: UserProfile
  canWrite?: boolean
}

export const IdentityPanel = ({ id, profile, canWrite }: IdentityPanelProps) => {
  const { t } = useTranslation()
  const patch = usePatchUser(id)

  return (
    <FieldsPanel
      title={t('sections.identity.title')}
      icon={IdCard}
      status="ok"
      canWrite={canWrite}
      editTitle={t('sections.identity.editTitle')}
      conflictMessage={t('sections.identity.emailConflict')}
      fields={[
        { key: 'position', label: t('sections.identity.position') },
        { key: 'country', label: t('sections.identity.country') },
        { key: 'city', label: t('sections.identity.city') },
        { key: 'workEmail', label: t('sections.identity.workEmail') },
        { key: 'workPhone', label: t('sections.identity.workPhone') },
        { key: 'birthDay', label: t('sections.identity.birthDay'), type: 'number' },
        { key: 'birthMonth', label: t('sections.identity.birthMonth'), type: 'number' },
        {
          key: 'companyJoinDate',
          label: t('sections.identity.companyJoinDate'),
          editable: false,
        },
      ]}
      values={{
        position: profile.position,
        country: profile.country,
        city: profile.city,
        workEmail: profile.workEmail,
        workPhone: profile.workPhone,
        birthDay: profile.birthDay,
        birthMonth: profile.birthMonth,
        companyJoinDate: formatDate(profile.companyJoinDate),
      }}
      onSave={body => patch.mutateAsync(body as PatchIdentityBody)}
    />
  )
}
