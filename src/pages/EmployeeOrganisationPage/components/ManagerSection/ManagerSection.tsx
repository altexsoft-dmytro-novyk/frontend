import { useRef } from 'react'
import { RefreshCw, UserMinus, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { PersonPicker } from '@/components/PersonPicker/PersonPicker'
import type { CurrentEdgeState } from '../../hooks/useEmployeeOrganisationPage'
import { DerivedValue } from '../DerivedValue/DerivedValue'
import { PermissionNotice } from '../PermissionNotice/PermissionNotice'
import { SectionCard } from '../SectionCard/SectionCard'
import { useManagerSection } from './hooks/useManagerSection'

interface ManagerSectionProps {
  routeId: string
  canWrite: boolean
  state: CurrentEdgeState
  onWriteForbidden: () => void
}

export const ManagerSection = ({
  routeId,
  canWrite,
  state,
  onWriteForbidden,
}: ManagerSectionProps) => {
  const { t } = useTranslation()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const {
    pickerOpen,
    pickerMode,
    openAssignPicker,
    openReassignPicker,
    closePicker,
    pick,
    removeOpen,
    setRemoveOpen,
    confirmRemove,
    error,
    justAssignedName,
    removedNow,
    isBusy,
    partialFailure,
    pendingReassignName,
    retryReassign,
  } = useManagerSection({
    routeId,
    state,
    onWriteForbidden,
    returnFocus: () => triggerRef.current?.focus(),
  })

  const authoritativeEdge = state.kind === 'authoritative' ? state.edge : null
  const showReassign = canWrite && authoritativeEdge !== null
  const derivedHint = state.kind === 'derived' && state.derived.state === 'assigned'

  const excludeIds = [routeId]
  if (authoritativeEdge) {
    excludeIds.push(authoritativeEdge.target.id)
  } else if (state.kind === 'derived' && state.derived.state === 'assigned') {
    excludeIds.push(state.derived.targetUserId)
  }

  return (
    <SectionCard
      testId="organisation-manager"
      title={t('organisation.manager.title')}
      action={
        canWrite ? (
          showReassign ? (
            <div className="flex flex-wrap gap-2">
              <Button
                ref={triggerRef}
                type="button"
                variant="outline"
                size="sm"
                onClick={openReassignPicker}
                disabled={isBusy}
                data-testid="organisation-reassign-manager"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {t('organisation.manager.reassign')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRemoveOpen(true)}
                disabled={isBusy}
                data-testid="organisation-remove-manager"
              >
                <UserMinus className="h-3.5 w-3.5" />
                {t('organisation.manager.remove')}
              </Button>
            </div>
          ) : (
            <Button
              ref={triggerRef}
              type="button"
              variant="outline"
              size="sm"
              onClick={openAssignPicker}
              disabled={isBusy}
              data-testid="organisation-assign-manager"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {t('organisation.manager.assign')}
            </Button>
          )
        ) : null
      }
    >
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t('organisation.currentLabel')}
          </p>
          {removedNow && !justAssignedName ? (
            <p className="text-sm text-muted-foreground" data-testid="organisation-manager-removed">
              {t('organisation.manager.removedNow')}
            </p>
          ) : (
            <DerivedValue
              state={state}
              testIdPrefix="organisation-manager-derived"
              justAssignedName={justAssignedName}
            />
          )}
        </div>

        {!canWrite ? <PermissionNotice testId="organisation-manager-permission-notice" /> : null}

        {partialFailure ? (
          <div
            className="space-y-2"
            role="alert"
            data-testid="organisation-manager-partial-failure"
          >
            <p className="text-sm text-destructive">
              {t('organisation.manager.error.partialFailure', { name: pendingReassignName ?? '' })}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void retryReassign()}
              disabled={isBusy}
              data-testid="organisation-manager-retry-reassign"
            >
              {t('organisation.manager.error.retry')}
            </Button>
          </div>
        ) : error ? (
          <p
            className="text-sm text-destructive"
            role="alert"
            data-testid="organisation-manager-error"
          >
            {error}
          </p>
        ) : null}

        {derivedHint ? (
          <p
            className="text-xs text-muted-foreground"
            data-testid="organisation-manager-derived-note"
          >
            {t('organisation.manager.derivedHintNote')}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">{t('organisation.manager.hint')}</p>
      </div>

      {pickerOpen ? (
        <PersonPicker
          title={
            pickerMode === 'reassign'
              ? t('organisation.manager.reassignPickerTitle')
              : t('organisation.manager.pickerTitle')
          }
          description={
            pickerMode === 'reassign'
              ? t('organisation.manager.reassignPickerDescription')
              : t('organisation.manager.pickerDescription')
          }
          excludeIds={excludeIds}
          busy={isBusy}
          onPick={pick}
          onClose={closePicker}
        />
      ) : null}

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('organisation.manager.removeDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('organisation.manager.removeDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>
              {t('organisation.manager.removeDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isBusy}
              onClick={event => {
                event.preventDefault()
                void confirmRemove()
              }}
            >
              {t('organisation.manager.removeDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionCard>
  )
}
