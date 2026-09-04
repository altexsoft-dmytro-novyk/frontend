import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAssignManager } from '@/api/hooks/useAssignManager'
import {
  ReassignManagerError,
  useReassignManager,
  type ReassignManagerVars,
} from '@/api/hooks/useReassignManager'
import { useRemoveManager } from '@/api/hooks/useRemoveManager'
import { errorCode, httpStatus } from '@/lib/http'
import type { PickerPerson } from '@/components/PersonPicker/hooks/usePersonPicker'
import type { CurrentEdge, CurrentEdgeState } from '../../../hooks/useEmployeeOrganisationPage'

interface UseManagerSectionArgs {
  routeId: string
  state: CurrentEdgeState
  onWriteForbidden: () => void
  /** Move keyboard focus back to the section's trigger button. */
  returnFocus: () => void
}

const KEY = 'organisation.manager.error'

export type ManagerPickerMode = 'assign' | 'reassign'

const authoritativeEdge = (state: CurrentEdgeState): CurrentEdge | null =>
  state.kind === 'authoritative' ? state.edge : null

export const useManagerSection = ({
  routeId,
  state,
  onWriteForbidden,
  returnFocus,
}: UseManagerSectionArgs) => {
  const { t } = useTranslation()
  const assignMutation = useAssignManager(routeId)
  const reassignMutation = useReassignManager(routeId)
  const removeMutation = useRemoveManager(routeId)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerMode, setPickerMode] = useState<ManagerPickerMode>('assign')
  const [removeOpen, setRemoveOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justAssignedName, setJustAssignedName] = useState<string | null>(null)
  const [removedNow, setRemovedNow] = useState(false)
  const [pendingReassign, setPendingReassign] = useState<
    (ReassignManagerVars & { name: string }) | null
  >(null)

  const edge = authoritativeEdge(state)
  const isBusy = assignMutation.isPending || reassignMutation.isPending || removeMutation.isPending

  const fallbackMessage = (status: number | undefined) =>
    status === undefined || status >= 500 ? t(`${KEY}.network`) : t(`${KEY}.generic`)

  const openAssignPicker = () => {
    setError(null)
    setPickerMode('assign')
    setPickerOpen(true)
  }

  const openReassignPicker = () => {
    setError(null)
    setPendingReassign(null)
    reassignMutation.reset()
    setPickerMode('reassign')
    setPickerOpen(true)
  }

  const closePicker = () => {
    setPickerOpen(false)
    returnFocus()
  }

  const performAssign = async (person: PickerPerson) => {
    try {
      await assignMutation.mutateAsync(person.id)
      setJustAssignedName(person.name)
      setRemovedNow(false)
      returnFocus()
    } catch (caught) {
      const status = httpStatus(caught)
      if (status === 403) {
        onWriteForbidden()
        return
      }
      if (status === 409) {
        setError(
          errorCode(caught) === 'target_has_scheduled_departure'
            ? t(`${KEY}.targetDeparting`)
            : t(`${KEY}.alreadyAssigned`)
        )
      } else if (status === 400) {
        setError(t(`${KEY}.generic`))
      } else {
        setError(fallbackMessage(status))
      }
      returnFocus()
    }
  }

  const runReassign = async (vars: ReassignManagerVars, name: string) => {
    try {
      await reassignMutation.mutateAsync(vars)
      setJustAssignedName(name)
      setRemovedNow(false)
      setPendingReassign(null)
      returnFocus()
    } catch (caught) {
      if (caught instanceof ReassignManagerError && caught.stage === 'delete') {
        const status = httpStatus(caught.originalError)
        setPendingReassign(null)
        if (status === 403) {
          onWriteForbidden()
          return
        }
        setError(fallbackMessage(status))
        returnFocus()
        return
      }
      // The assign leg failed: the previous manager is already gone. The section
      // renders the recovery copy from `partialFailure`; `retryReassign` re-runs
      // only the POST. Nothing else to set here.
      returnFocus()
    }
  }

  const performReassign = async (person: PickerPerson) => {
    if (!edge) {
      return
    }
    const vars: ReassignManagerVars = {
      currentRelationshipId: edge.relationshipId,
      newTargetId: person.id,
    }
    setPendingReassign({ ...vars, name: person.name })
    await runReassign(vars, person.name)
  }

  const pick = async (person: PickerPerson) => {
    setPickerOpen(false)
    setJustAssignedName(null)
    setError(null)

    if (person.id === routeId) {
      setError(t(`${KEY}.self`))
      returnFocus()
      return
    }

    if (pickerMode === 'reassign') {
      await performReassign(person)
    } else {
      await performAssign(person)
    }
  }

  const retryReassign = async () => {
    if (!pendingReassign) {
      return
    }
    const { name, ...vars } = pendingReassign
    await runReassign(vars, name)
  }

  const confirmRemove = async () => {
    if (!edge) {
      setRemoveOpen(false)
      return
    }
    setError(null)
    setJustAssignedName(null)
    try {
      await removeMutation.mutateAsync(edge.relationshipId)
      setRemoveOpen(false)
      setRemovedNow(true)
      returnFocus()
    } catch (caught) {
      setRemoveOpen(false)
      const status = httpStatus(caught)
      if (status === 403) {
        onWriteForbidden()
        return
      }
      setError(status === 404 ? t(`${KEY}.noneToRemove`) : fallbackMessage(status))
      returnFocus()
    }
  }

  return {
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
    /** `true` while the previous manager is removed but the new assignment
     * hasn't landed — show the recovery copy and the retry action. */
    partialFailure: reassignMutation.previousManagerRemoved,
    pendingReassignName: pendingReassign?.name ?? null,
    retryReassign,
  }
}
