import { useState } from 'react'
import { CheckSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { sectionAccess, useActionItems } from '@/api/hooks/useProfileSections'
import { useCreateActionItem, useUpdateActionItem } from '@/api/hooks/useProfileMutations'
import { SectionCard } from '@/pages/PersonProfilePage/components/SectionCard/SectionCard'
import { AddRecordDialog } from '@/pages/PersonProfilePage/components/AddRecordDialog/AddRecordDialog'
import { useSectionWrite } from '@/pages/PersonProfilePage/hooks/useSectionWrite'

interface ActionItemsPanelProps {
  id: string
  canWrite?: boolean
}

export const ActionItemsPanel = ({ id, canWrite }: ActionItemsPanelProps) => {
  const { t } = useTranslation()
  const query = useActionItems(id)
  const create = useCreateActionItem(id)
  const update = useUpdateActionItem(id)
  const { denied, busy, run } = useSectionWrite()
  const [title, setTitle] = useState('')
  const showAdd = canWrite !== false && !denied

  const submit = async () => {
    const result = await run(() => create.mutateAsync(title.trim()))
    if (result !== null) {
      setTitle('')
      return true
    }
    return false
  }

  const items = query.data?.actionitems ?? []

  return (
    <SectionCard
      title={t('sections.actionItems.title')}
      icon={CheckSquare}
      status={sectionAccess(query)}
      headerAction={
        !showAdd ? (
          <span className="text-xs text-muted-foreground">{t('common.readOnly')}</span>
        ) : (
          <AddRecordDialog
            title={t('sections.actionItems.addTitle')}
            busy={busy}
            canSubmit={title.trim().length > 0}
            onSubmit={submit}
          >
            <div className="space-y-1.5">
              <Label htmlFor="ai-title">{t('sections.actionItems.titleLabel')}</Label>
              <Input id="ai-title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
          </AddRecordDialog>
        )
      }
    >
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('sections.actionItems.empty')}</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map(item => (
            <li key={item.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="text-foreground">{item.title || '—'}</span>
              <div className="flex items-center gap-2">
                <Badge variant={item.status === 'completed' ? 'secondary' : 'outline'}>
                  {item.status === 'completed'
                    ? t('sections.actionItems.statusCompleted')
                    : t('sections.actionItems.statusOpen')}
                </Badge>
                {item.status !== 'completed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      void run(() => update.mutateAsync({ itemId: item.id, status: 'completed' }))
                    }
                  >
                    {t('sections.actionItems.markComplete')}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
