import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useImportPopulation } from '@/api/hooks/useImportPopulation'
import { errorBody, httpStatus } from '@/lib/http'
import type { ImportSummary } from '@/types/api'

/**
 * `idle` — nothing tried yet (or the picker was re-armed after a failure / a result).
 * `uploading` — the `POST /users/import` is in flight.
 * `done` — a `200` summary is on screen (partial success included).
 * `fileError` — a `400`: the backend `message` is shown verbatim, nothing
 *   imported, the picker is usable again.
 * `forbidden` — a `403`: the caller lacks `user-management:create`.
 * `error` — a transport failure, a `413`, a `5xx`, an unexpected `4xx`, or a
 *   `200` with a malformed body. The server was reached (or unreachable);
 *   nothing was imported.
 */
export type ImportPhase = 'idle' | 'uploading' | 'done' | 'fileError' | 'forbidden' | 'error'

/** Read a Nest error body's `message` (string or string[]) as one line. */
const readBackendMessage = (caught: unknown): string | null => {
  const body = errorBody<{ message?: unknown }>(caught)
  if (typeof body?.message === 'string' && body.message.trim() !== '') {
    return body.message
  }
  if (Array.isArray(body?.message) && body.message.length > 0) {
    return body.message.filter(part => typeof part === 'string').join(' ')
  }
  return null
}

/** A `200` body that is actually an `ImportSummary` — the counts must be numbers. */
const isImportSummary = (value: unknown): value is ImportSummary =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as ImportSummary).created === 'number' &&
  typeof (value as ImportSummary).updated === 'number'

export const useEmployeeImportPage = () => {
  const { t } = useTranslation()
  const mutation = useImportPopulation()

  const [file, setFileState] = useState<File | null>(null)
  const [phase, setPhase] = useState<ImportPhase>('idle')
  const [result, setResult] = useState<ImportSummary | null>(null)
  const [fileErrorMessage, setFileErrorMessage] = useState<string | null>(null)
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  // Attempt-and-handle: starts `true`, flips `false` for the rest of the visit
  // on the first `403` from the import (same pattern as the profile /
  // organisation / departure screens — there is no `/me` capability probe).
  const [canWrite, setCanWrite] = useState(true)
  // A synchronous in-flight latch — `phase === 'uploading'` is set via an async
  // state update and would race a fast double-click / double-confirm.
  const inFlightRef = useRef(false)

  const canSubmitFile = file !== null && file.size > 0

  const selectFile = (next: File | null) => {
    setFileState(next)
    // Re-arm the picker after a terminal failure so a corrected file can be sent.
    if (phase === 'fileError' || phase === 'error') {
      setPhase('idle')
      setFileErrorMessage(null)
      setServerErrorMessage(null)
    }
  }

  /** Open the confirm dialog (the write is a large create/update batch). */
  const requestSubmit = () => {
    if (!canWrite || !canSubmitFile || phase === 'uploading' || inFlightRef.current) {
      return
    }
    setConfirmOpen(true)
  }

  const cancelConfirm = () => setConfirmOpen(false)

  const confirmSubmit = async () => {
    setConfirmOpen(false)
    if (!canWrite || !canSubmitFile || inFlightRef.current || !file) {
      return
    }
    inFlightRef.current = true
    setPhase('uploading')
    setResult(null)
    setFileErrorMessage(null)
    setServerErrorMessage(null)

    try {
      const summary = await mutation.mutateAsync(file)
      if (!isImportSummary(summary)) {
        setServerErrorMessage(t('import.serverError'))
        setPhase('error')
        return
      }
      setResult(summary)
      setPhase('done')
    } catch (caught) {
      const status = httpStatus(caught)
      if (status === 403) {
        setCanWrite(false)
        setPhase('forbidden')
        return
      }
      if (status === 400) {
        setFileErrorMessage(readBackendMessage(caught) ?? t('import.fileError.fallback'))
        setPhase('fileError')
        return
      }
      // `401` is handled by the global interceptor. `413` gets its own copy;
      // everything else — transport failure, `5xx`, an unexpected `4xx` — is the
      // generic "didn't complete" message.
      setServerErrorMessage(
        status === 413 ? t('import.serverErrorTooLarge') : t('import.serverError')
      )
      setPhase('error')
    } finally {
      inFlightRef.current = false
    }
  }

  /** Back to a fresh picker after a result — the fix-and-re-upload loop. */
  const reset = () => {
    setPhase('idle')
    setResult(null)
    setFileState(null)
    setFileErrorMessage(null)
    setServerErrorMessage(null)
  }

  return {
    file,
    phase,
    result,
    fileErrorMessage,
    serverErrorMessage,
    canWrite,
    canSubmitFile,
    confirmOpen,
    selectFile,
    requestSubmit,
    confirmSubmit,
    cancelConfirm,
    reset,
  }
}
