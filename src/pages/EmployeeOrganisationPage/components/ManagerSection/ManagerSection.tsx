import { useRef } from 'react'
import { UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { DerivedCurrent } from '../../helpers/journalDerived'
import { DerivedValue } from '../DerivedValue/DerivedValue'
import { PermissionNotice } from '../PermissionNotice/PermissionNotice'
import { PersonPicker } from '@/components/PersonPicker/PersonPicker'
import { SectionCard } from '../SectionCard/SectionCard'
import { useManagerSection } from './hooks/useManagerSection'

interface ManagerSectionProps {
  routeId: string
  canWrite: boolean
  derived: DerivedCurrent
  onWriteForbidden: () => void
}

export const ManagerSection = ({
  routeId,
  canWrite,
  derived,
  onWriteForbidden,
}: ManagerSectionProps) => {
  const { t } = useTranslation()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { pickerOpen, openPicker, closePicker, pick, error, justAssignedName, isAssigning } =
    useManagerSection({
      routeId,
      onWriteForbidden,
      returnFocus: () => triggerRef.current?.focus(),
    })

  const excludeIds = [routeId]
  if (derived.state === 'assigned') {
    excludeIds.push(derived.targetUserId)
  }

  return (
    <SectionCard
      testId="organisation-manager"
      title={t('organisation.manager.title')}
      action={
        canWrite ? (
          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            size="sm"
            onClick={openPicker}
            disabled={isAssigning}
            data-testid="organisation-assign-manager"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {t('organisation.manager.assign')}
          </Button>
        ) : null
      }
    >
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t('organisation.currentLabel')}
          </p>
          <DerivedValue
            derived={derived}
            testIdPrefix="organisation-manager-derived"
            justAssignedName={justAssignedName}
          />
        </div>

        {!canWrite ? <PermissionNotice testId="organisation-manager-permission-notice" /> : null}

        {error ? (
          <p
            className="text-sm text-destructive"
            role="alert"
            data-testid="organisation-manager-error"
          >
            {error}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">{t('organisation.manager.hint')}</p>
      </div>

      {pickerOpen ? (
        <PersonPicker
          title={t('organisation.manager.pickerTitle')}
          description={t('organisation.manager.pickerDescription')}
          excludeIds={excludeIds}
          busy={isAssigning}
          onPick={pick}
          onClose={closePicker}
        />
      ) : null}
    </SectionCard>
  )
}
