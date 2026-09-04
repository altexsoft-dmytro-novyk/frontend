import { useRef } from 'react'
import { UserMinus, UserPlus } from 'lucide-react'
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
import type { CurrentEdgeState } from '../../hooks/useEmployeeOrganisationPage'
import { DerivedValue } from '../DerivedValue/DerivedValue'
import { PermissionNotice } from '../PermissionNotice/PermissionNotice'
import { PersonPicker } from '@/components/PersonPicker/PersonPicker'
import { SectionCard } from '../SectionCard/SectionCard'
import { usePeoplePartnerSection } from './hooks/usePeoplePartnerSection'

interface PeoplePartnerSectionProps {
  routeId: string
  canWrite: boolean
  state: CurrentEdgeState
  onWriteForbidden: () => void
}

export const PeoplePartnerSection = ({
  routeId,
  canWrite,
  state,
  onWriteForbidden,
}: PeoplePartnerSectionProps) => {
  const { t } = useTranslation()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const {
    pickerOpen,
    openPicker,
    closePicker,
    pick,
    removeOpen,
    setRemoveOpen,
    confirmRemove,
    replaceOpen,
    pendingPerson,
    confirmReplace,
    cancelReplace,
    error,
    staleToken,
    refresh,
    justAssignedName,
    removedNow,
    isBusy,
  } = usePeoplePartnerSection({
    routeId,
    state,
    onWriteForbidden,
    returnFocus: () => triggerRef.current?.focus(),
  })

  const currentEdge = state.kind === 'authoritative' ? state.edge : null

  const excludeIds = [routeId]
  if (currentEdge) {
    excludeIds.push(currentEdge.target.id)
  } else if (state.kind === 'derived' && state.derived.state === 'assigned') {
    excludeIds.push(state.derived.targetUserId)
  }

  return (
    <SectionCard
      testId="organisation-people-partner"
      title={t('organisation.peoplePartner.title')}
      action={
        canWrite ? (
          <div className="flex flex-wrap gap-2">
            <Button
              ref={triggerRef}
              type="button"
              variant="outline"
              size="sm"
              onClick={openPicker}
              disabled={isBusy}
              data-testid="organisation-assign-pp"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {t('organisation.peoplePartner.assign')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRemoveOpen(true)}
              disabled={isBusy}
              data-testid="organisation-remove-pp"
            >
              <UserMinus className="h-3.5 w-3.5" />
              {t('organisation.peoplePartner.remove')}
            </Button>
          </div>
        ) : null
      }
    >
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t('organisation.currentLabel')}
          </p>
          {removedNow && !justAssignedName ? (
            <p className="text-sm text-muted-foreground" data-testid="organisation-pp-removed">
              {t('organisation.peoplePartner.removedNow')}
            </p>
          ) : (
            <DerivedValue
              state={state}
              testIdPrefix="organisation-pp-derived"
              justAssignedName={justAssignedName}
            />
          )}
        </div>

        {!canWrite ? <PermissionNotice testId="organisation-pp-permission-notice" /> : null}

        {staleToken ? (
          <div className="space-y-2" role="alert" data-testid="organisation-pp-stale">
            <p className="text-sm text-destructive">
              {t('organisation.peoplePartner.error.staleToken')}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isBusy}
              data-testid="organisation-pp-refresh"
            >
              {t('organisation.peoplePartner.staleRefresh')}
            </Button>
          </div>
        ) : error ? (
          <p className="text-sm text-destructive" role="alert" data-testid="organisation-pp-error">
            {error}
          </p>
        ) : null}
      </div>

      {pickerOpen ? (
        <PersonPicker
          title={t('organisation.peoplePartner.pickerTitle')}
          description={t('organisation.peoplePartner.pickerDescription')}
          excludeIds={excludeIds}
          busy={isBusy}
          onPick={pick}
          onClose={closePicker}
        />
      ) : null}

      <AlertDialog open={replaceOpen} onOpenChange={next => (next ? undefined : cancelReplace())}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('organisation.peoplePartner.replaceDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('organisation.peoplePartner.replaceDialog.description', {
                name: pendingPerson?.name ?? '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>
              {t('organisation.peoplePartner.replaceDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isBusy}
              onClick={event => {
                event.preventDefault()
                void confirmReplace()
              }}
            >
              {t('organisation.peoplePartner.replaceDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('organisation.peoplePartner.removeDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('organisation.peoplePartner.removeDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>
              {t('organisation.peoplePartner.removeDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isBusy}
              onClick={event => {
                event.preventDefault()
                void confirmRemove()
              }}
            >
              {t('organisation.peoplePartner.removeDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionCard>
  )
}
