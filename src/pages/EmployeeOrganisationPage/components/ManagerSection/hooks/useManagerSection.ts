import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAssignManager } from '@/api/hooks/useAssignManager'
import { errorCode, httpStatus } from '@/lib/http'
import type { PickerPerson } from '../../PersonPicker/hooks/usePersonPicker'

interface UseManagerSectionArgs {
  routeId: string
  onWriteForbidden: () => void
  /** Move keyboard focus back to the "Assign manager" button. */
  returnFocus: () => void
}

export const useManagerSection = ({
  routeId,
  onWriteForbidden,
  returnFocus,
}: UseManagerSectionArgs) => {
  const { t } = useTranslation()
  const mutation = useAssignManager(routeId)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justAssignedName, setJustAssignedName] = useState<string | null>(null)

  const openPicker = () => {
    setError(null)
    setPickerOpen(true)
  }

  const closePicker = () => {
    setPickerOpen(false)
    returnFocus()
  }

  const pick = async (person: PickerPerson) => {
    setPickerOpen(false)
    // A stale "just assigned <name>" badge must never sit next to a later error.
    setJustAssignedName(null)
    setError(null)

    // Self-assignment is blocked client-side — no request is sent.
    if (person.id === routeId) {
      setError(t('organisation.manager.error.self'))
      returnFocus()
      return
    }

    try {
      await mutation.mutateAsync(person.id)
      setJustAssignedName(person.name)
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
            ? t('organisation.manager.error.targetDeparting')
            : t('organisation.manager.error.alreadyAssigned')
        )
      } else if (status === undefined || status >= 500) {
        setError(t('organisation.manager.error.network'))
      } else {
        // `400` here is a server rejection other than self (already blocked) —
        // still just a generic failure.
        setError(t('organisation.manager.error.generic'))
      }
      returnFocus()
    }
  }

  return {
    pickerOpen,
    openPicker,
    closePicker,
    pick,
    error,
    justAssignedName,
    isAssigning: mutation.isPending,
  }
}
