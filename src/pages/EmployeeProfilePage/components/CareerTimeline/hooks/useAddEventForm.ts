import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useCreateCareerEvent } from '@/api/hooks/useCreateCareerEvent'
import type { CreateCareerEventPayload } from '@/types/api'
import { classifyMutationError } from '../../../helpers/mutationError'
import { isRealIsoDate } from '../../../helpers/isoDate'

export interface AddEventFormValues {
  type: string
  eventDate: string
  details: string
}

const buildSchema = (t: (key: string) => string) =>
  z.object({
    type: z.string().trim().min(1, t('profile.timeline.dialog.error.typeRequired')),
    eventDate: z.string().refine(isRealIsoDate, {
      message: t('profile.timeline.dialog.error.dateRequired'),
    }),
    details: z.string(),
  })

interface ParsedDetails {
  /** A translated error message, or `undefined` when parsing succeeded. */
  error?: string
  /** The parsed object, or `undefined` when the textarea was blank. */
  value?: Record<string, unknown>
}

/** Parse the optional JSON textarea: blank → omit; non-object → error. */
const parseDetails = (raw: string, t: (key: string) => string): ParsedDetails => {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return {}
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return { error: t('profile.timeline.dialog.error.detailsJson') }
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { error: t('profile.timeline.dialog.error.detailsObject') }
  }
  return { value: parsed as Record<string, unknown> }
}

export const useAddEventForm = (employeeId: string, onSuccess: () => void) => {
  const { t } = useTranslation()
  const mutation = useCreateCareerEvent(employeeId)

  const form = useForm<AddEventFormValues>({
    // zod's inferred input type turns partial when the object carries a refine;
    // the schema still validates presence, so assert the concrete field shape.
    resolver: zodResolver(buildSchema(t)) as Resolver<AddEventFormValues>,
    defaultValues: { type: '', eventDate: '', details: '' },
    mode: 'onSubmit',
  })

  const onSubmit = form.handleSubmit(async values => {
    const details = parseDetails(values.details, t)
    if (details.error) {
      form.setError('details', { message: details.error })
      return
    }

    const payload: CreateCareerEventPayload = {
      type: values.type.trim(),
      eventDate: values.eventDate,
    }
    if (details.value !== undefined) {
      payload.details = details.value
    }

    try {
      await mutation.mutateAsync(payload)
      form.reset()
      onSuccess()
    } catch (error) {
      // The dialog stays open with the error and the fields preserved so the
      // value can be fixed: `400` → generic, `403`/`404` → access changed,
      // transport/`5xx` → try again.
      const kind = classifyMutationError(error)
      form.setError('root', { message: t(`profile.timeline.dialog.error.${kind}`) })
    }
  })

  return { form, onSubmit, isSubmitting: mutation.isPending, reset: () => form.reset() }
}
