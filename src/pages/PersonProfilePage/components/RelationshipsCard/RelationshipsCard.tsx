import { useState } from 'react'
import { Network } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PersonPicker } from '@/components/PersonPicker/PersonPicker'
import { httpStatus } from '@/api/client'
import { useChangeDepartmentManager, useChangeRelationship } from '@/api/hooks/useRelationships'
import type { RelationshipField, UserProfile } from '@/types/domain'

interface RelationshipsCardProps {
  id: string
  profile: UserProfile
  currentUserId: string
}

type Target =
  | { kind: 'relationship'; field: RelationshipField; label: string; current: string | null }
  | { kind: 'departmentManager'; label: string; current: string | null }

export const RelationshipsCard = ({ id, profile, currentUserId }: RelationshipsCardProps) => {
  const { t } = useTranslation()
  const changeRel = useChangeRelationship(id)
  const changeDeptManager = useChangeDepartmentManager(id)
  const [target, setTarget] = useState<Target | null>(null)
  const [value, setValue] = useState<string | null>(null)

  const open = (next: Target) => {
    setTarget(next)
    setValue(next.current)
  }

  const submit = async () => {
    if (!target) return
    try {
      if (target.kind === 'relationship') {
        await changeRel.mutateAsync({ field: target.field, value })
      } else if (profile.department) {
        await changeDeptManager.mutateAsync({ departmentId: profile.department.id, value })
      }
      toast.success(t('relationships.changed'))
      setTarget(null)
    } catch (error) {
      const status = httpStatus(error)
      if (status === 403) toast.error(t('relationships.selfAssign'))
      else if (status === 409) toast.error(t('relationships.conflict'))
      else toast.error(t('common.somethingWentWrong'))
    }
  }

  const busy = changeRel.isPending || changeDeptManager.isPending

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Network className="h-4 w-4 text-muted-foreground" />
          {t('relationships.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            open({
              kind: 'relationship',
              field: 'manager',
              label: t('relationships.changeManager'),
              current: profile.manager?.id ?? null,
            })
          }
        >
          {t('relationships.changeManager')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            open({
              kind: 'relationship',
              field: 'people_partner',
              label: t('relationships.changePeoplePartner'),
              current: profile.peoplePartner?.id ?? null,
            })
          }
        >
          {t('relationships.changePeoplePartner')}
        </Button>
        {profile.department && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              open({
                kind: 'departmentManager',
                label: t('relationships.changeDepartmentManager'),
                current: null,
              })
            }
          >
            {t('relationships.changeDepartmentManager')}
          </Button>
        )}
      </CardContent>

      <Dialog open={target !== null} onOpenChange={o => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{target?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>{t('relationships.pickPerson')}</Label>
            <PersonPicker value={value} onChange={setValue} excludeIds={[currentUserId]} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => void submit()} disabled={busy}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
