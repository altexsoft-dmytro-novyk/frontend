import { CalendarOff, FolderGit2, Inbox, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  sectionAccess,
  useCustomFields,
  useLeaves,
  useRequestHistory,
} from '@/api/hooks/useProfileSections'
import { SectionCard } from '@/pages/PersonProfilePage/components/SectionCard/SectionCard'
import { DefinitionList } from '@/pages/PersonProfilePage/components/DefinitionList/DefinitionList'
import type { UserProfile } from '@/types/domain'

interface PanelProps {
  id: string
}

export const ProjectsPanel = ({ profile }: { profile: UserProfile }) => {
  const { t } = useTranslation()
  const projects = profile.projects ?? []
  return (
    <SectionCard title={t('sections.projects.title')} icon={FolderGit2} status="ok">
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('sections.projects.empty')}</p>
      ) : (
        <ul className="space-y-1 text-sm text-foreground">
          {projects.map((project, index) => (
            <li key={project.id ?? `${project.name}-${index}`}>{project.name}</li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

export const LeavesPanel = ({ id }: PanelProps) => {
  const { t } = useTranslation()
  const query = useLeaves(id)
  return (
    <SectionCard
      title={t('sections.leaves.title')}
      icon={CalendarOff}
      status={sectionAccess(query)}
    >
      <p className="text-sm text-muted-foreground">{t('sections.leaves.managedInTimetracker')}</p>
      <Button variant="link" className="h-auto p-0 text-sm" asChild>
        <a href="https://timetracker.example" target="_blank" rel="noreferrer">
          {t('sections.leaves.openTimetracker')}
        </a>
      </Button>
    </SectionCard>
  )
}

export const RequestHistoryPanel = ({ id }: PanelProps) => {
  const { t } = useTranslation()
  const query = useRequestHistory(id)
  return (
    <SectionCard
      title={t('sections.requestHistory.title')}
      icon={Inbox}
      status={sectionAccess(query)}
    >
      <p className="text-sm text-muted-foreground">{t('sections.requestHistory.empty')}</p>
    </SectionCard>
  )
}

export const CustomFieldsPanel = ({ id }: PanelProps) => {
  const { t } = useTranslation()
  const query = useCustomFields(id)
  const fields = query.data?.customfields ?? {}
  const entries = Object.entries(fields)

  return (
    <SectionCard
      title={t('sections.customFields.title')}
      icon={SlidersHorizontal}
      status={sectionAccess(query)}
    >
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('sections.customFields.empty')}</p>
      ) : (
        <DefinitionList
          items={entries.map(([key, value]) => ({ label: key, value: String(value) }))}
        />
      )}
    </SectionCard>
  )
}
