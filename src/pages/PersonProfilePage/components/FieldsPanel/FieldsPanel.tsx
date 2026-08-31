import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SectionCard } from '@/pages/PersonProfilePage/components/SectionCard/SectionCard'
import { DefinitionList } from '@/pages/PersonProfilePage/components/DefinitionList/DefinitionList'
import { useSectionWrite } from '@/pages/PersonProfilePage/hooks/useSectionWrite'
import type { SectionAccess } from '@/api/hooks/useProfileSections'

export interface PanelFieldDef {
  key: string
  label: string
  type?: 'text' | 'number'
  editable?: boolean
}

interface FieldsPanelProps {
  title: string
  icon: LucideIcon
  status: SectionAccess
  editTitle: string
  fields: PanelFieldDef[]
  values: Record<string, unknown>
  onSave: (patch: Record<string, string | number>) => Promise<unknown>
  conflictMessage?: string
  /** From the profile access map: `false` hides Edit, `undefined` shows it optimistically. */
  canWrite?: boolean
}

export const FieldsPanel = ({
  title,
  icon,
  status,
  editTitle,
  fields,
  values,
  onSave,
  conflictMessage,
  canWrite,
}: FieldsPanelProps) => {
  const { t } = useTranslation()
  const { denied, busy, run } = useSectionWrite()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})

  const editableFields = fields.filter(f => f.editable !== false)
  const showEdit = canWrite !== false && !denied && editableFields.length > 0

  const openDialog = () => {
    const initial: Record<string, string> = {}
    for (const field of editableFields) {
      const value = values[field.key]
      initial[field.key] = value === null || value === undefined ? '' : String(value)
    }
    setDraft(initial)
    setOpen(true)
  }

  const submit = async () => {
    const patch: Record<string, string | number> = {}
    for (const field of editableFields) {
      const raw = draft[field.key]?.trim() ?? ''
      if (raw === '') continue
      patch[field.key] = field.type === 'number' ? Number(raw) : raw
    }
    const result = await run(() => onSave(patch), {
      successMessage: t('common.save'),
      conflictMessage,
    })
    if (result !== null) setOpen(false)
  }

  return (
    <SectionCard
      title={title}
      icon={icon}
      status={status}
      headerAction={
        showEdit ? (
          <Button variant="ghost" size="sm" onClick={openDialog}>
            <Pencil className="h-3.5 w-3.5" />
            {t('common.edit')}
          </Button>
        ) : denied ? (
          <span className="text-xs text-muted-foreground">{t('common.readOnly')}</span>
        ) : null
      }
    >
      <DefinitionList
        items={fields.map(f => ({ label: f.label, value: values[f.key] as string }))}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {editableFields.map(field => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`f-${field.key}`}>{field.label}</Label>
                <Input
                  id={`f-${field.key}`}
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={draft[field.key] ?? ''}
                  onChange={e => setDraft(d => ({ ...d, [field.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submit} disabled={busy}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  )
}
