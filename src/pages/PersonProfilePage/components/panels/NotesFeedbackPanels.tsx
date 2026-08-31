import { MessageSquare, StickyNote } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sectionAccess, useFeedbacks, useNotes } from '@/api/hooks/useProfileSections'
import { useAddFeedback, useAddNote } from '@/api/hooks/useProfileMutations'
import { FlaggedRecordsPanel } from './FlaggedRecordsPanel'

interface PanelProps {
  id: string
  canWrite?: boolean
}

export const NotesPanel = ({ id, canWrite }: PanelProps) => {
  const { t } = useTranslation()
  const query = useNotes(id)
  const add = useAddNote(id)

  return (
    <FlaggedRecordsPanel
      title={t('sections.notes.title')}
      icon={StickyNote}
      status={sectionAccess(query)}
      canWrite={canWrite}
      addTitle={t('sections.notes.addTitle')}
      bodyLabel={t('sections.notes.body')}
      flagLabel={t('sections.notes.visibleForEmployee')}
      emptyText={t('sections.notes.empty')}
      records={(query.data?.notes ?? []).map(n => ({
        id: n.id,
        body: n.body,
        flag: n.visibleForEmployee,
      }))}
      onAdd={(body, flag) => add.mutateAsync({ body, visibleForEmployee: flag })}
    />
  )
}

export const FeedbacksPanel = ({ id, canWrite }: PanelProps) => {
  const { t } = useTranslation()
  const query = useFeedbacks(id)
  const add = useAddFeedback(id)

  return (
    <FlaggedRecordsPanel
      title={t('sections.feedbacks.title')}
      icon={MessageSquare}
      status={sectionAccess(query)}
      canWrite={canWrite}
      addTitle={t('sections.feedbacks.addTitle')}
      bodyLabel={t('sections.feedbacks.body')}
      flagLabel={t('sections.feedbacks.sharedWithEmployee')}
      emptyText={t('sections.feedbacks.empty')}
      records={(query.data?.feedbacks ?? []).map(f => ({
        id: f.id,
        body: f.body,
        flag: f.sharedWithEmployee,
      }))}
      onAdd={(body, flag) => add.mutateAsync({ body, sharedWithEmployee: flag })}
    />
  )
}
