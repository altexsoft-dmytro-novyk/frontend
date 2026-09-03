import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useEmployee } from '@/api/hooks/useEmployee'
import { useRecordDeparture } from '@/api/hooks/useRecordDeparture'
import { useReparentDeparture } from '@/api/hooks/useReparentDeparture'
import { fullName } from '@/lib/employeeFormatters'
import { errorBody, errorCode, httpStatus } from '@/lib/http'
import type {
  BlockedDepartureResponse,
  DepartureView,
  RecordDeparturePayload,
  ReparentingResult,
} from '@/types/api'

interface UseBlockerResolutionArgs {
  routeId: string
  response: BlockedDepartureResponse
  payload: RecordDeparturePayload
  onWriteForbidden: () => void
  onRecorded: (view: DepartureView) => boolean
  onBlocked: (response: BlockedDepartureResponse, payload: RecordDeparturePayload) => void
  /**
   * The record `Idempotency-Key`. `forceFresh` mints a new one — the
   * post-reparenting "record now" is a genuinely new attempt; a plain
   * re-`POST` to refresh the blocker version reuses the form-fill's key.
   */
  idempotencyKeyFor: (payload: RecordDeparturePayload, forceFresh?: boolean) => string
}

type Resolution = 'pending' | 'cleared' | 'external-remain'

export const useBlockerResolution = ({
  routeId,
  response,
  payload,
  onWriteForbidden,
  onRecorded,
  onBlocked,
  idempotencyKeyFor,
}: UseBlockerResolutionArgs) => {
  const { t } = useTranslation()
  const reparent = useReparentDeparture(routeId)
  const record = useRecordDeparture(routeId)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resolution, setResolution] = useState<Resolution>('pending')
  const [externalRemaining, setExternalRemaining] = useState(0)
  const [reassigned, setReassigned] = useState<ReparentingResult['reassigned'] | null>(null)

  // `useEmployee('')` is disabled (`enabled: id.length > 0`) — no default target
  // means no `GET /users/` fires, and the panel still works via "choose someone else".
  const defaultTargetId = response.defaultReparentTargetId ?? ''
  const defaultTargetQuery = useEmployee(defaultTargetId)
  const defaultTargetName = defaultTargetQuery.data?.data
    ? fullName(defaultTargetQuery.data.data)
    : null

  const isBusy = reparent.isPending || record.isPending

  const openPicker = () => {
    setError(null)
    setPickerOpen(true)
  }
  const closePicker = () => setPickerOpen(false)

  /** Re-`POST` the departure with the stable key to pull a fresh blocker version
   * (no row exists yet — the blocker check runs before any write). */
  const refreshBlockers = async () => {
    try {
      const view = await record.mutateAsync({
        payload,
        idempotencyKey: idempotencyKeyFor(payload),
      })
      if (!onRecorded(view)) {
        setError(t('departure.blockers.error.network'))
      }
    } catch (caught) {
      const status = httpStatus(caught)
      const code = errorCode(caught)
      if (status === 403) {
        onWriteForbidden()
        return
      }
      if (status === 409 && code === 'departure_blocked_by_responsibilities') {
        const body = errorBody<BlockedDepartureResponse>(caught)
        if (body) {
          setResolution('pending')
          onBlocked(body, payload)
          setError(t('departure.blockers.error.versionStale'))
          return
        }
      }
      setError(t('departure.blockers.error.network'))
    }
  }

  const reparentTo = async (targetId: string) => {
    setPickerOpen(false)
    setError(null)

    if (targetId === routeId) {
      setError(t('departure.blockers.error.selfTarget'))
      return
    }

    try {
      const result = await reparent.mutateAsync({
        targetId,
        expectedBlockerVersion: response.expectedBlockerVersion,
      })
      const remaining = Number(result.remainingExternalBlockers) || 0
      setReassigned(result.reassigned)
      if (remaining === 0) {
        setResolution('cleared')
      } else {
        setExternalRemaining(remaining)
        setResolution('external-remain')
      }
    } catch (caught) {
      const status = httpStatus(caught)
      const code = errorCode(caught)
      if (status === 403) {
        onWriteForbidden()
        return
      }
      if (status === 409 && code === 'blocker_version_stale') {
        await refreshBlockers()
        return
      }
      if (status === 409 && code === 'departure_already_scheduled') {
        setError(t('departure.blockers.error.alreadyScheduled'))
      } else if (status === 400) {
        setError(t('departure.blockers.error.selfTarget'))
      } else if (status === 404) {
        setError(t('departure.blockers.error.unknownTarget'))
      } else if (status === 422) {
        setError(t('departure.blockers.error.inactiveTarget'))
      } else {
        setError(t('departure.blockers.error.network'))
      }
    }
  }

  const recordNow = async () => {
    setError(null)
    try {
      const view = await record.mutateAsync({
        payload,
        idempotencyKey: idempotencyKeyFor(payload, true),
      })
      if (!onRecorded(view)) {
        setError(t('departure.blockers.error.network'))
      }
    } catch (caught) {
      const status = httpStatus(caught)
      const code = errorCode(caught)
      if (status === 403) {
        onWriteForbidden()
        return
      }
      if (status === 409 && code === 'departure_blocked_by_responsibilities') {
        const body = errorBody<BlockedDepartureResponse>(caught)
        if (body) {
          setResolution('pending')
          setReassigned(null)
          onBlocked(body, payload)
          setError(t('departure.blockers.error.stillBlocked'))
          return
        }
      }
      if (status === 409 && code === 'departure_already_scheduled') {
        setError(t('departure.blockers.error.alreadyScheduled'))
        return
      }
      setError(t('departure.blockers.error.network'))
    }
  }

  return {
    pickerOpen,
    openPicker,
    closePicker,
    reparentTo,
    recordNow,
    error,
    resolution,
    externalRemaining,
    reassigned,
    hasDefaultTarget: defaultTargetId.length > 0,
    defaultTargetId,
    defaultTargetName,
    isBusy,
  }
}
