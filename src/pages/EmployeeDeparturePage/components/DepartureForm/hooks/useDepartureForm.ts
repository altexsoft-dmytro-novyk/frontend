import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useRecordDeparture } from '@/api/hooks/useRecordDeparture'
import { errorBody, errorCode, httpStatus } from '@/lib/http'
import type { BlockedDepartureResponse, DepartureView, RecordDeparturePayload } from '@/types/api'
import { isNotPastIsoDate, isRealIsoDate } from '../../../helpers/departureDate'

const REASON_MAX = 2000

export interface DepartureFormValues {
  effectiveDate: string
  reason: string
}

interface UseDepartureFormArgs {
  routeId: string
  onWriteForbidden: () => void
  onRecorded: (view: DepartureView) => boolean
  onBlocked: (response: BlockedDepartureResponse, payload: RecordDeparturePayload) => void
  idempotencyKeyFor: (payload: RecordDeparturePayload) => string
}

const buildSchema = (t: (key: string) => string) =>
  z
    .object({
      effectiveDate: z.string(),
      reason: z
        .string()
        .trim()
        .min(1, t('departure.form.error.reasonRequired'))
        .max(REASON_MAX, t('departure.form.error.reasonTooLong')),
    })
    .superRefine((values, ctx) => {
      if (!isRealIsoDate(values.effectiveDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['effectiveDate'],
          message: t('departure.form.error.dateInvalid'),
        })
        return
      }
      if (!isNotPastIsoDate(values.effectiveDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['effectiveDate'],
          message: t('departure.form.error.dateNotFuture'),
        })
      }
    })

export const useDepartureForm = ({
  routeId,
  onWriteForbidden,
  onRecorded,
  onBlocked,
  idempotencyKeyFor,
}: UseDepartureFormArgs) => {
  const { t } = useTranslation()
  const mutation = useRecordDeparture(routeId)
  const [confirmValues, setConfirmValues] = useState<DepartureFormValues | null>(null)

  const form = useForm<DepartureFormValues>({
    // zod's inferred input turns partial under a refine; the schema still
    // validates presence, so assert the concrete field shape.
    resolver: zodResolver(buildSchema(t)) as Resolver<DepartureFormValues>,
    defaultValues: { effectiveDate: '', reason: '' },
    mode: 'onSubmit',
  })

  // Submit only opens the confirm dialog — a departure is an irreversible
  // termination with no cancel route, so it must be explicitly confirmed.
  const onSubmit = form.handleSubmit(values => {
    form.clearErrors('root')
    setConfirmValues(values)
  })

  const cancelConfirm = () => setConfirmValues(null)

  const confirmSubmit = async () => {
    const values = confirmValues
    setConfirmValues(null)
    if (!values) {
      return
    }

    const payload: RecordDeparturePayload = {
      effectiveDate: values.effectiveDate,
      reason: values.reason.trim(),
    }
    const idempotencyKey = idempotencyKeyFor(payload)

    try {
      const view = await mutation.mutateAsync({ payload, idempotencyKey })
      if (!onRecorded(view)) {
        form.setError('root', { message: t('departure.form.error.noId') })
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
          onBlocked(body, payload)
          return
        }
      }
      if (status === 409 && code === 'departure_already_scheduled') {
        form.setError('root', { message: t('departure.form.error.alreadyScheduled') })
        return
      }
      if (status === 409 && code === 'idempotency_key_payload_mismatch') {
        form.setError('root', { message: t('departure.form.error.keyMismatch') })
        return
      }
      if (status === 400) {
        // The backend uses `BUSINESS_TIME_ZONE` for the exact future boundary —
        // its `400` is almost always the effective date, so land it on that field.
        form.setError('effectiveDate', { message: t('departure.form.error.dateRejected') })
        return
      }
      if (status !== undefined && status >= 400 && status < 500) {
        form.setError('root', { message: t('departure.form.error.generic') })
        return
      }
      form.setError('root', { message: t('departure.form.error.network') })
    }
  }

  return {
    form,
    onSubmit,
    confirmValues,
    confirmSubmit,
    cancelConfirm,
    isSubmitting: mutation.isPending,
  }
}
