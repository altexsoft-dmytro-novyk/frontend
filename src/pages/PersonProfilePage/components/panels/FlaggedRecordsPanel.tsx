import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { SectionCard } from '@/pages/PersonProfilePage/components/SectionCard/SectionCard'
import { AddRecordDialog } from '@/pages/PersonProfilePage/components/AddRecordDialog/AddRecordDialog'
import { useSectionWrite } from '@/pages/PersonProfilePage/hooks/useSectionWrite'
import type { SectionAccess } from '@/api/hooks/useProfileSections'

interface FlaggedRecord {
  id: string
  body: string
  flag: boolean
}

interface FlaggedRecordsPanelProps {
  title: string
  icon: LucideIcon
  status: SectionAccess
  addTitle: string
  bodyLabel: string
  flagLabel: string
  emptyText: string
  records: FlaggedRecord[]
  onAdd: (body: string, flag: boolean) => Promise<unknown>
  canWrite?: boolean
}

export const FlaggedRecordsPanel = ({
  title,
  icon,
  status,
  addTitle,
  bodyLabel,
  flagLabel,
  emptyText,
  records,
  onAdd,
  canWrite,
}: FlaggedRecordsPanelProps) => {
  const { t } = useTranslation()
  const { denied, busy, run } = useSectionWrite()
  const [body, setBody] = useState('')
  const [flag, setFlag] = useState(false)
  const showAdd = canWrite !== false && !denied

  const submit = async () => {
    const result = await run(() => onAdd(body.trim(), flag))
    if (result !== null) {
      setBody('')
      setFlag(false)
      return true
    }
    return false
  }

  return (
    <SectionCard
      title={title}
      icon={icon}
      status={status}
      headerAction={
        !showAdd ? (
          <span className="text-xs text-muted-foreground">{t('common.readOnly')}</span>
        ) : (
          <AddRecordDialog
            title={addTitle}
            busy={busy}
            canSubmit={body.trim().length > 0}
            onSubmit={submit}
          >
            <div className="space-y-1.5">
              <Label htmlFor="rec-body">{bodyLabel}</Label>
              <Textarea id="rec-body" value={body} onChange={e => setBody(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={flag} onCheckedChange={v => setFlag(v === true)} />
              {flagLabel}
            </label>
          </AddRecordDialog>
        )
      }
    >
      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {records.map(record => (
            <li key={record.id} className="rounded-md border border-border p-2">
              <p className="text-foreground">{record.body}</p>
              {record.flag && (
                <Badge variant="outline" className="mt-1">
                  {flagLabel}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
