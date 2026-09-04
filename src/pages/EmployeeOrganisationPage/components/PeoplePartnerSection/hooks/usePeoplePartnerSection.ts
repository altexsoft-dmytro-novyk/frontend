import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useChangePeoplePartner } from '@/api/hooks/useChangePeoplePartner'
import { useRemovePeoplePartner } from '@/api/hooks/useRemovePeoplePartner'
import { errorCode, httpStatus } from '@/lib/http'
import type { CurrentEdgeState } from '../../../hooks/useEmployeeOrganisationPage'
import type { PickerPerson } from '@/components/PersonPicker/hooks/usePersonPicker'

interface UsePeoplePartnerSectionArgs {
  routeId: string
  state: CurrentEdgeState
  onWriteForbidden: () => void
  /** Move keyboard focus back to the "Assign / replace" button. */
  returnFocus: () => void
}

const KEY = 'organisation.peoplePartner.error'

export const usePeoplePartnerSection = ({
  routeId,
  state,
  onWriteForbidden,
  returnFocus,
}: UsePeoplePartnerSectionArgs) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const changeMutation = useChangePeoplePartner(routeId)
  const removeMutation = useRemovePeoplePartner(routeId)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [replaceOpen, setReplaceOpen] = useState(false)
  const [pendingPerson, setPendingPerson] = useState<PickerPerson | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [staleToken, setStaleToken] = useState(false)
  const [justAssignedName, setJustAssignedName] = useState<string | null>(null)
  const [removedNow, setRemovedNow] = useState(false)

  const currentEdge = state.kind === 'authoritative' ? state.edge : null
  const expectedCurrentTargetId = currentEdge?.target.id
  const hasCurrent =
    currentEdge !== null || (state.kind === 'derived' && state.derived.state === 'assigned')

  const isBusy = changeMutation.isPending || removeMutation.isPending

  const fallbackMessage = (status: number | undefined) =>
    status === undefined || status >= 500 ? t(`${KEY}.network`) : t(`${KEY}.generic`)

  const clearMessages = () => {
    setError(null)
    setStaleToken(false)
  }

  const openPicker = () => {
    clearMessages()
    setPickerOpen(true)
  }

  const closePicker = () => {
    setPickerOpen(false)
    returnFocus()
  }

  const refresh = () => {
    clearMessages()
    void queryClient.invalidateQueries({ queryKey: ['employee', routeId, 'relationships'] })
    void queryClient.invalidateQueries({ queryKey: ['employee', routeId, 'access-journal'] })
    returnFocus()
  }

  const performAssign = async (person: PickerPerson) => {
    setJustAssignedName(null)
    clearMessages()
    try {
      await changeMutation.mutateAsync({ targetId: person.id, expectedCurrentTargetId })
      setJustAssignedName(person.name)
      setRemovedNow(false)
      returnFocus()
    } catch (caught) {
      const status = httpStatus(caught)
      if (status === 403) {
        onWriteForbidden()
        return
      }
      if (status === 404) {
        setError(t(`${KEY}.unknownTarget`))
      } else if (status === 422) {
        setError(t(`${KEY}.inactiveTarget`))
      } else if (status === 409) {
        if (errorCode(caught) === 'target_has_scheduled_departure') {
          setError(t(`${KEY}.targetDeparting`))
        } else if (expectedCurrentTargetId !== undefined) {
          setStaleToken(true)
        } else {
          setError(t(`${KEY}.generic`))
        }
      } else if (status === 400) {
        setError(t(`${KEY}.generic`))
      } else {
        setError(fallbackMessage(status))
      }
      returnFocus()
    }
  }

  const pick = async (person: PickerPerson) => {
    setPickerOpen(false)
    setJustAssignedName(null)
    clearMessages()

    if (person.id === routeId) {
      setError(t(`${KEY}.self`))
      returnFocus()
      return
    }

    // Replacing an existing People Partner is a destructive overwrite — confirm.
    if (hasCurrent) {
      setPendingPerson(person)
      setReplaceOpen(true)
      return
    }
    await performAssign(person)
  }

  const confirmReplace = async () => {
    const person = pendingPerson
    setReplaceOpen(false)
    setPendingPerson(null)
    if (person) {
      await performAssign(person)
    }
  }

  const cancelReplace = () => {
    setReplaceOpen(false)
    setPendingPerson(null)
    returnFocus()
  }

  const confirmRemove = async () => {
    clearMessages()
    setJustAssignedName(null)
    try {
      await removeMutation.mutateAsync(expectedCurrentTargetId)
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
      if (status === 409 && expectedCurrentTargetId !== undefined) {
        setStaleToken(true)
      } else if (status === 404) {
        setError(t(`${KEY}.noneToRemove`))
      } else {
        setError(fallbackMessage(status))
      }
      returnFocus()
    }
  }

  return {
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
  }
}
