import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeparture } from '@/api/hooks/useDeparture'
import { useRetryDeparture } from '@/api/hooks/useRetryDeparture'
import { errorCode, httpStatus } from '@/lib/http'
import type { DepartureView } from '@/types/api'

export type DepartureStatusPhase = 'loading' | 'ready' | 'gone' | 'forbidden' | 'error'

/** After this many worker attempts on a `retry_wait` row, surface an advisory —
 * the backend has no terminal-failed state, so it will keep retrying forever. */
const LONG_RETRY_THRESHOLD = 5

interface UseDepartureStatusArgs {
  routeId: string
  departureId: string
}

export const useDepartureStatus = ({ routeId, departureId }: UseDepartureStatusArgs) => {
  const { t } = useTranslation()
  const query = useDeparture(routeId, departureId)
  const retry = useRetryDeparture(routeId, departureId)
  // The note is pinned to the row state it was raised for; once the row moves on
  // (a poll lands `applied`, say) a stale "can no longer be retried" note drops
  // out on its own — no effect needed.
  const [noteFor, setNoteFor] = useState<{ text: string; state: string | undefined } | null>(null)

  const view: DepartureView | null = query.data ?? null
  const note = noteFor && noteFor.state === view?.state ? noteFor.text : null
  const setNote = (text: string | null) =>
    setNoteFor(text === null ? null : { text, state: view?.state })

  const status = httpStatus(query.error)

  let phase: DepartureStatusPhase
  if (query.isError) {
    phase = status === 404 ? 'gone' : status === 403 ? 'forbidden' : 'error'
  } else if (query.isLoading) {
    phase = 'loading'
  } else {
    phase = 'ready'
  }

  const retryNow = async () => {
    setNote(null)
    try {
      await retry.mutateAsync()
      setNote(t('departure.status.retry.requested'))
      void query.refetch()
    } catch (caught) {
      const caughtStatus = httpStatus(caught)
      if (caughtStatus === 404) {
        void query.refetch()
        setNote(t('departure.status.retry.gone'))
        return
      }
      if (caughtStatus === 403) {
        void query.refetch()
        setNote(t('departure.status.retry.forbidden'))
        return
      }
      if (caughtStatus === 409 && errorCode(caught) === 'departure_not_retryable') {
        void query.refetch()
        setNote(t('departure.status.retry.notRetryable'))
        return
      }
      setNote(t('departure.status.retry.failed'))
    }
  }

  return {
    phase,
    view,
    note,
    longRetry: view?.state === 'retry_wait' && (view.attempts ?? 0) > LONG_RETRY_THRESHOLD,
    retryNow,
    isRetrying: retry.isPending,
    refetch: () => {
      void query.refetch()
    },
  }
}
