import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { sectionAccess, useDocuments } from '@/api/hooks/useProfileSections'
import { useAddDocument } from '@/api/hooks/useProfileMutations'
import { SectionCard } from '@/pages/PersonProfilePage/components/SectionCard/SectionCard'
import { AddRecordDialog } from '@/pages/PersonProfilePage/components/AddRecordDialog/AddRecordDialog'
import { useSectionWrite } from '@/pages/PersonProfilePage/hooks/useSectionWrite'

interface DocumentsPanelProps {
  id: string
  isSelf: boolean
  canWrite?: boolean
}

export const DocumentsPanel = ({ id, isSelf, canWrite }: DocumentsPanelProps) => {
  const { t } = useTranslation()
  const query = useDocuments(id)
  const add = useAddDocument(id)
  const { denied, busy, run } = useSectionWrite()
  const [type, setType] = useState(isSelf ? 'certificate' : '')
  const [title, setTitle] = useState('')
  // Self can always add a certificate to their own profile (§4.3), even
  // though S5 is read-level for them.
  const showAdd = (canWrite !== false || isSelf) && !denied

  const submit = async () => {
    const result = await run(() => add.mutateAsync({ type: type.trim(), title: title.trim() }))
    if (result !== null) {
      setTitle('')
      return true
    }
    return false
  }

  const docs = query.data?.documents ?? []

  return (
    <SectionCard
      title={t('sections.documents.title')}
      icon={FileText}
      status={sectionAccess(query)}
      headerAction={
        !showAdd ? (
          <span className="text-xs text-muted-foreground">{t('common.readOnly')}</span>
        ) : (
          <AddRecordDialog
            title={t('sections.documents.addTitle')}
            busy={busy}
            canSubmit={Boolean(type.trim() && title.trim())}
            onSubmit={submit}
          >
            {isSelf && (
              <p className="text-xs text-muted-foreground">
                {t('sections.documents.certificateOnlyHint')}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="doc-type">{t('sections.documents.type')}</Label>
              <Input
                id="doc-type"
                value={type}
                disabled={isSelf}
                onChange={e => setType(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-title">{t('sections.documents.name')}</Label>
              <Input id="doc-title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
          </AddRecordDialog>
        )
      }
    >
      {docs.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('sections.documents.empty')}</p>
      ) : (
        <ul className="divide-y divide-border">
          {docs.map(doc => (
            <li key={doc.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-foreground">{doc.title}</span>
              <Badge variant="outline">{doc.type}</Badge>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
