import { Briefcase } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEmployment, sectionAccess } from '@/api/hooks/useProfileSections'
import { usePatchEmployment } from '@/api/hooks/useProfileMutations'
import { FieldsPanel } from '@/pages/PersonProfilePage/components/FieldsPanel/FieldsPanel'

interface EmploymentPanelProps {
  id: string
  canWrite?: boolean
}

export const EmploymentPanel = ({ id, canWrite }: EmploymentPanelProps) => {
  const { t } = useTranslation()
  const query = useEmployment(id)
  const patch = usePatchEmployment(id)
  const data = query.data

  return (
    <FieldsPanel
      title={t('sections.employment.title')}
      icon={Briefcase}
      status={sectionAccess(query)}
      canWrite={canWrite}
      editTitle={t('sections.employment.title')}
      fields={[
        { key: 'grade', label: t('sections.employment.grade') },
        { key: 'position', label: t('sections.employment.position'), editable: false },
        { key: 'employmentStatus', label: t('sections.employment.status'), editable: false },
      ]}
      values={{
        grade: data?.grade ?? '',
        position: data?.position ?? '',
        employmentStatus: data ? t(`profile.status.${data.employmentStatus}`) : '',
      }}
      onSave={body => patch.mutateAsync({ grade: String(body.grade ?? '') })}
    />
  )
}
