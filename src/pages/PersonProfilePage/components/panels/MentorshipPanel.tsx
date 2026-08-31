import { useState } from 'react'
import { HeartHandshake } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { usePatchUser } from '@/api/hooks/useUsers'
import { useCreateMentorshipPair } from '@/api/hooks/useProfileMutations'
import { PersonPicker } from '@/components/PersonPicker/PersonPicker'
import { SectionCard } from '@/pages/PersonProfilePage/components/SectionCard/SectionCard'
import { AddRecordDialog } from '@/pages/PersonProfilePage/components/AddRecordDialog/AddRecordDialog'
import { useSectionWrite } from '@/pages/PersonProfilePage/hooks/useSectionWrite'
import type { UserProfile } from '@/types/domain'

interface MentorshipPanelProps {
  id: string
  profile: UserProfile
  isSelf: boolean
  canWrite?: boolean
}

export const MentorshipPanel = ({ id, profile, isSelf, canWrite }: MentorshipPanelProps) => {
  const { t } = useTranslation()
  const patch = usePatchUser(id)
  const createPair = useCreateMentorshipPair(id)
  const { denied, busy, run } = useSectionWrite()
  const [mentee, setMentee] = useState<string | null>(null)
  const showAssign = canWrite !== false && !denied

  // S13 is embedded in the profile only when the viewer has access.
  if (profile.openToMentoring === undefined && !profile.mentorship) {
    return null
  }

  const pairs = profile.mentorship?.pairs ?? []

  const assign = async () => {
    if (!mentee) return false
    const result = await run(() => createPair.mutateAsync({ mentorId: id, menteeId: mentee }))
    if (result !== null) {
      setMentee(null)
      return true
    }
    return false
  }

  return (
    <SectionCard
      title={t('sections.mentorship.title')}
      icon={HeartHandshake}
      status="ok"
      headerAction={
        showAssign ? (
          <AddRecordDialog
            title={t('sections.mentorship.assignTitle')}
            triggerLabel={t('sections.mentorship.assignTitle')}
            busy={busy}
            canSubmit={Boolean(mentee)}
            onSubmit={assign}
          >
            <div className="space-y-1.5">
              <Label>{t('sections.mentorship.menteeLabel')}</Label>
              <PersonPicker value={mentee} onChange={setMentee} excludeIds={[id]} />
            </div>
          </AddRecordDialog>
        ) : null
      }
    >
      <div className="space-y-3">
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm">
            {t('sections.mentorship.openToMentoring')}
            <span className="block text-xs text-muted-foreground">
              {t('sections.mentorship.openToMentoringHint')}
            </span>
          </span>
          <Switch
            checked={Boolean(profile.openToMentoring)}
            disabled={!isSelf || patch.isPending}
            onCheckedChange={checked => patch.mutate({ openToMentoring: checked })}
          />
        </label>

        {pairs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('sections.mentorship.empty')}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {pairs.map(pair => (
              <li key={pair.id} className="flex items-center gap-2">
                <Badge variant="outline">
                  {pair.mentorId === id
                    ? t('sections.mentorship.asMentor')
                    : t('sections.mentorship.asMentee')}
                </Badge>
                <span className="text-muted-foreground">{pair.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  )
}
