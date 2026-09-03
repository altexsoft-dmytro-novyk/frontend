import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useChangePeoplePartner } from '@/api/hooks/useChangePeoplePartner'
import { useRemovePeoplePartner } from '@/api/hooks/useRemovePeoplePartner'
import { errorCode, httpStatus } from '@/lib/http'
import type { DerivedCurrent } from '../../../helpers/journalDerived'
import type { PickerPerson } from '../../PersonPicker/hooks/usePersonPicker'

interface UsePeoplePartnerSectionArgs {
  routeId: string
  derived: DerivedCurrent
  onWriteForbidden: () => void
  /** Move keyboard focus back to the "Assign / replace" button. */
  returnFocus: () => void
}

const KEY = 'organisation.peoplePartner.error'

export const usePeoplePartnerSection = ({
  routeId,
  derived,
  onWriteForbidden,
  returnFocus,
}: UsePeoplePartnerSectionArgs) => {
  const { t } = useTranslation()
  const changeMutation = useChangePeoplePartner(routeId)
  const removeMutation = useRemovePeoplePartner(routeId)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [replaceOpen, setReplaceOpen] = useState(false)
  const [pendingPerson, setPendingPerson] = useState<PickerPerson | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [justAssignedName, setJustAssignedName] = useState<string | null>(null)
  const [removedNow, setRemovedNow] = useState(false)

  const isBusy = changeMutation.isPending || removeMutation.isPending

  const fallbackMessage = (status: number | undefined) =>
    status === undefined || status >= 500 ? t(`${KEY}.network`) : t(`${KEY}.generic`)

  const openPicker = () => {
    setError(null)
    setPickerOpen(true)
  }

  const closePicker = () => {
    setPickerOpen(false)
    returnFocus()
  }

  const performAssign = async (person: PickerPerson) => {
    setJustAssignedName(null)
    setError(null)
    try {
      await changeMutation.mutateAsync(person.id)
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
        setError(
          errorCode(caught) === 'target_has_scheduled_departure'
            ? t(`${KEY}.targetDeparting`)
            : t(`${KEY}.generic`)
        )
      } else if (status === 400) {
        // Self is blocked client-side; a server `400` is some other rejection.
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
    setError(null)

    if (person.id === routeId) {
      setError(t(`${KEY}.self`))
      returnFocus()
      return
    }

    // Replacing an existing People Partner is a destructive overwrite — confirm.
    if (derived.state === 'assigned') {
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
    setError(null)
    setJustAssignedName(null)
    try {
      await removeMutation.mutateAsync()
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
    justAssignedName,
    removedNow,
    isBusy,
  }
}
