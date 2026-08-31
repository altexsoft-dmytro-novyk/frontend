import { GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { sectionAccess, useAssessments } from '@/api/hooks/useProfileSections'
import { useCompleteIdp } from '@/api/hooks/useProfileMutations'
import { httpStatus } from '@/api/client'
import { SectionCard } from '@/pages/PersonProfilePage/components/SectionCard/SectionCard'
import { DefinitionList } from '@/pages/PersonProfilePage/components/DefinitionList/DefinitionList'

interface CdsPanelProps {
  id: string
  isSelf: boolean
}

export const CdsPanel = ({ id, isSelf }: CdsPanelProps) => {
  const { t } = useTranslation()
  const query = useAssessments(id)
  const complete = useCompleteIdp(id)
  const data = query.data

  const markComplete = async () => {
    try {
      await complete.mutateAsync('current')
      toast.success(t('common.save'))
    } catch (error) {
      toast.error(
        httpStatus(error) === 403 ? t('common.noPermission') : t('common.somethingWentWrong')
      )
    }
  }

  return (
    <SectionCard title={t('sections.cds.title')} icon={GraduationCap} status={sectionAccess(query)}>
      <div className="space-y-3">
        <DefinitionList
          items={[
            {
              label: t('sections.cds.skillsMatrix'),
              value: data?.cds.skillsMatrixLink ?? null,
            },
            {
              label: t('sections.cds.cycle'),
              value: data?.cycle ?? t('sections.cds.noCycle'),
            },
          ]}
        />
        {isSelf && (
          <Button
            variant="outline"
            size="sm"
            disabled={complete.isPending}
            onClick={() => void markComplete()}
          >
            {t('sections.cds.markComplete')}
          </Button>
        )}
      </div>
    </SectionCard>
  )
}
