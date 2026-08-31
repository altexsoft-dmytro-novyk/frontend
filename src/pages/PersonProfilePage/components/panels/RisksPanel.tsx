import { useState } from 'react'
import { ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { sectionAccess, useRisks } from '@/api/hooks/useProfileSections'
import { useAddRisk } from '@/api/hooks/useProfileMutations'
import { SectionCard } from '@/pages/PersonProfilePage/components/SectionCard/SectionCard'
import { AddRecordDialog } from '@/pages/PersonProfilePage/components/AddRecordDialog/AddRecordDialog'
import { useSectionWrite } from '@/pages/PersonProfilePage/hooks/useSectionWrite'
import type { RiskLevel } from '@/types/domain'

const LEVELS: RiskLevel[] = ['low', 'need attention', 'medium', 'high', 'leaver']

interface RisksPanelProps {
  id: string
  canWrite?: boolean
}

export const RisksPanel = ({ id, canWrite }: RisksPanelProps) => {
  const { t } = useTranslation()
  const query = useRisks(id)
  const add = useAddRisk(id)
  const { denied, busy, run } = useSectionWrite()
  const showAdd = canWrite !== false && !denied
  const [level, setLevel] = useState<RiskLevel>('need attention')
  const [description, setDescription] = useState('')

  const submit = async () => {
    const result = await run(() => add.mutateAsync({ level, description: description.trim() }))
    if (result !== null) {
      setDescription('')
      return true
    }
    return false
  }

  const risks = query.data?.risks ?? []
  const prev = risks.length > 1 ? risks[risks.length - 2] : undefined
  const current = query.data?.level ?? null
  const trend = prev && current ? LEVELS.indexOf(current) - LEVELS.indexOf(prev.level) : 0

  return (
    <SectionCard
      title={t('sections.risks.title')}
      icon={ShieldAlert}
      status={sectionAccess(query)}
      headerAction={
        !showAdd ? (
          <span className="text-xs text-muted-foreground">{t('common.readOnly')}</span>
        ) : (
          <AddRecordDialog
            title={t('sections.risks.addTitle')}
            busy={busy}
            canSubmit={description.trim().length > 0}
            onSubmit={submit}
          >
            <div className="space-y-1.5">
              <Label>{t('sections.risks.level')}</Label>
              <Select value={level} onValueChange={v => setLevel(v as RiskLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map(l => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="risk-desc">{t('sections.risks.description')}</Label>
              <Textarea
                id="risk-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </AddRecordDialog>
        )
      }
    >
      {risks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('sections.risks.empty')}</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge>{current}</Badge>
            {trend > 0 && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                <TrendingUp className="h-3.5 w-3.5" /> {t('sections.risks.trendUp')}
              </span>
            )}
            {trend < 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingDown className="h-3.5 w-3.5" /> {t('sections.risks.trendDown')}
              </span>
            )}
          </div>
          <ul className="space-y-2 text-sm">
            {[...risks].reverse().map(risk => (
              <li key={risk.id} className="rounded-md border border-border p-2">
                <span className="font-medium text-foreground">{risk.level}</span>
                <span className="block text-muted-foreground">{risk.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  )
}
