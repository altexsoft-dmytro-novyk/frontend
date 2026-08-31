import { Phone, Siren } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  useEmergencyContacts,
  usePersonalContacts,
  sectionAccess,
} from '@/api/hooks/useProfileSections'
import {
  usePatchEmergencyContacts,
  usePatchPersonalContacts,
} from '@/api/hooks/useProfileMutations'
import { FieldsPanel } from '@/pages/PersonProfilePage/components/FieldsPanel/FieldsPanel'

interface PanelProps {
  id: string
  canWrite?: boolean
}

export const PersonalContactsPanel = ({ id, canWrite }: PanelProps) => {
  const { t } = useTranslation()
  const query = usePersonalContacts(id)
  const patch = usePatchPersonalContacts(id)
  const data = query.data

  return (
    <FieldsPanel
      title={t('sections.personalContacts.title')}
      icon={Phone}
      status={sectionAccess(query)}
      canWrite={canWrite}
      editTitle={t('sections.personalContacts.title')}
      fields={[
        { key: 'personalPhone', label: t('sections.personalContacts.personalPhone') },
        { key: 'personalEmail', label: t('sections.personalContacts.personalEmail') },
        { key: 'messengers', label: t('sections.personalContacts.messengers') },
        { key: 'residentialAddress', label: t('sections.personalContacts.residentialAddress') },
        { key: 'currentPlaceOfStay', label: t('sections.personalContacts.currentPlaceOfStay') },
      ]}
      values={{
        personalPhone: data?.personalPhone ?? '',
        personalEmail: data?.personalEmail ?? '',
        messengers: data?.messengers ?? '',
        residentialAddress: data?.residentialAddress ?? '',
        currentPlaceOfStay: data?.currentPlaceOfStay ?? '',
      }}
      onSave={body => patch.mutateAsync(body as Record<string, string>)}
    />
  )
}

export const EmergencyContactsPanel = ({ id, canWrite }: PanelProps) => {
  const { t } = useTranslation()
  const query = useEmergencyContacts(id)
  const patch = usePatchEmergencyContacts(id)
  const data = query.data

  return (
    <FieldsPanel
      title={t('sections.emergencyContacts.title')}
      icon={Siren}
      status={sectionAccess(query)}
      canWrite={canWrite}
      editTitle={t('sections.emergencyContacts.title')}
      fields={[
        { key: 'contactPerson', label: t('sections.emergencyContacts.contactPerson') },
        { key: 'relationship', label: t('sections.emergencyContacts.relationship') },
        { key: 'contactPhone', label: t('sections.emergencyContacts.contactPhone') },
      ]}
      values={{
        contactPerson: data?.contactPerson ?? '',
        relationship: data?.relationship ?? '',
        contactPhone: data?.contactPhone ?? '',
      }}
      onSave={body => patch.mutateAsync(body as Record<string, string>)}
    />
  )
}
