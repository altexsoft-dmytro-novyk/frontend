import { useState } from 'react'
import { GitCommitVertical, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { sectionAccess, useEvents } from '@/api/hooks/useProfileSections'
import { useAddEvent, useDeleteEvent } from '@/api/hooks/useProfileMutations'
import { formatDate } from '@/helpers/format'
import { SectionCard } from '@/pages/PersonProfilePage/components/SectionCard/SectionCard'
import { AddRecordDialog } from '@/pages/PersonProfilePage/components/AddRecordDialog/AddRecordDialog'
import { useSectionWrite } from '@/pages/PersonProfilePage/hooks/useSectionWrite'
import {
  eventDetailText,
  eventIcon,
  eventLabel,
} from '@/pages/PersonProfilePage/helpers/careerEvents'

interface CareerTimelinePanelProps {
  id: string
  canWrite?: boolean
}

export const CareerTimelinePanel = ({ id, canWrite }: CareerTimelinePanelProps) => {
  const { t } = useTranslation()
  const query = useEvents(id)
  const add = useAddEvent(id)
  const del = useDeleteEvent(id)
  const { denied, busy, run } = useSectionWrite()
  // `denied` catches the case where the access map said 'write' but the
  // narrower AD-26 rule (direct manager / assigned PP only) rejects at POST.
  const showWrite = canWrite !== false && !denied
  const [type, setType] = useState('')
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')

  const submitAdd = async () => {
    const result = await run(() =>
      add.mutateAsync({
        type: type.trim() || undefined,
        eventDate: date || undefined,
        details: title.trim() ? { title: title.trim() } : undefined,
      })
    )
    if (result !== null) {
      setType('')
      setDate('')
      setTitle('')
      return true
    }
    return false
  }

  const remove = (eventId: string) => run(() => del.mutateAsync(eventId))

  const events = [...(query.data?.careertimeline ?? [])].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  )

  return (
    <SectionCard
      title={t('sections.careerTimeline.title')}
      icon={GitCommitVertical}
      status={sectionAccess(query)}
      headerAction={
        !showWrite ? (
          <span className="text-xs text-muted-foreground">{t('common.readOnly')}</span>
        ) : (
          <AddRecordDialog
            title={t('sections.careerTimeline.addTitle')}
            busy={busy}
            canSubmit={Boolean(title.trim())}
            onSubmit={submitAdd}
          >
            <p className="text-xs text-muted-foreground">
              {t('sections.careerTimeline.restrictedHint')}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="ev-type">{t('sections.careerTimeline.type')}</Label>
              <Input
                id="ev-type"
                placeholder="position_change"
                value={type}
                onChange={e => setType(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-date">{t('sections.careerTimeline.date')}</Label>
              <Input
                id="ev-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-title">{t('sections.careerTimeline.detailsTitle')}</Label>
              <Input id="ev-title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
          </AddRecordDialog>
        )
      }
    >
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('sections.careerTimeline.empty')}</p>
      ) : (
        <ol className="relative space-y-4 border-l border-border pl-6">
          {events.map(event => {
            const Icon = eventIcon(event.type)
            const detail = eventDetailText(event)
            return (
              <li key={event.id} className="relative">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{eventLabel(event.type)}</p>
                    {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
                    <p className="text-xs text-muted-foreground">{formatDate(event.eventDate)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {t(`sections.careerTimeline.${event.source}`)}
                    </Badge>
                    {showWrite && event.source === 'manual' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        aria-label={t('common.remove')}
                        onClick={() => void remove(event.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </SectionCard>
  )
}
