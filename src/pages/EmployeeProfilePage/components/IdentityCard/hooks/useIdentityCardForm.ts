import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isAxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useUpdateEmployee } from '@/api/hooks/useUpdateEmployee'
import type { S1IdentityCard, UpdateIdentityCardPayload } from '@/types/api'
import { classifyMutationError } from '../../../helpers/mutationError'
import { isRealIsoDate } from '../../../helpers/isoDate'

export interface IdentityCardFormValues {
  firstName: string
  lastName: string
  position: string
  country: string
  city: string
  workEmail: string
  workPhone: string
  birthDay: string
  birthMonth: string
  companyJoinDate: string
}

const toFormValues = (card: S1IdentityCard): IdentityCardFormValues => ({
  firstName: card.firstName,
  lastName: card.lastName,
  position: card.position,
  country: card.country,
  city: card.city ?? '',
  workEmail: card.workEmail,
  workPhone: card.workPhone ?? '',
  birthDay: card.birthDay == null ? '' : String(card.birthDay),
  birthMonth: card.birthMonth == null ? '' : String(card.birthMonth),
  companyJoinDate: card.companyJoinDate,
})

const isValidDay = (raw: string) => /^\d+$/.test(raw) && Number(raw) >= 1 && Number(raw) <= 31
const isValidMonth = (raw: string) => /^\d+$/.test(raw) && Number(raw) >= 1 && Number(raw) <= 12

const buildSchema = (t: (key: string) => string) =>
  z
    .object({
      firstName: z.string().trim().min(1, t('profile.edit.error.required')),
      lastName: z.string().trim().min(1, t('profile.edit.error.required')),
      position: z.string().trim().min(1, t('profile.edit.error.required')),
      country: z.string().trim().min(1, t('profile.edit.error.required')),
      city: z.string(),
      workEmail: z
        .string()
        .trim()
        .min(1, t('profile.edit.error.email'))
        .email(t('profile.edit.error.email')),
      workPhone: z.string(),
      birthDay: z.string(),
      birthMonth: z.string(),
      companyJoinDate: z.string().refine(isRealIsoDate, {
        message: t('profile.edit.error.date'),
      }),
    })
    .superRefine((values, ctx) => {
      if (values.birthDay !== '' && !isValidDay(values.birthDay)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['birthDay'],
          message: t('profile.edit.error.birthDayRange'),
        })
      }
      if (values.birthMonth !== '' && !isValidMonth(values.birthMonth)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['birthMonth'],
          message: t('profile.edit.error.birthMonthRange'),
        })
      }
      if ((values.birthDay === '') !== (values.birthMonth === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['birthMonth'],
          message: t('profile.edit.error.birthdayPair'),
        })
      }
    })

/** Only the fields whose form value differs from the loaded card. */
const changedPayload = (
  card: S1IdentityCard,
  values: IdentityCardFormValues
): UpdateIdentityCardPayload => {
  const original = toFormValues(card)
  const payload: UpdateIdentityCardPayload = {}
  if (values.firstName.trim() !== original.firstName) payload.firstName = values.firstName.trim()
  if (values.lastName.trim() !== original.lastName) payload.lastName = values.lastName.trim()
  if (values.position.trim() !== original.position) payload.position = values.position.trim()
  if (values.country.trim() !== original.country) payload.country = values.country.trim()
  if (values.city !== original.city) payload.city = values.city
  if (values.workEmail.trim() !== original.workEmail) payload.workEmail = values.workEmail.trim()
  if (values.workPhone !== original.workPhone) payload.workPhone = values.workPhone
  // A cleared birth day/month is not a supported backend edit (the column pair
  // is set-together only, and PATCH has no null path) — only a new value is sent.
  if (values.birthDay !== original.birthDay && values.birthDay !== '') {
    payload.birthDay = Number(values.birthDay)
  }
  if (values.birthMonth !== original.birthMonth && values.birthMonth !== '') {
    payload.birthMonth = Number(values.birthMonth)
  }
  if (values.companyJoinDate !== original.companyJoinDate) {
    payload.companyJoinDate = values.companyJoinDate
  }
  return payload
}

export const useIdentityCardForm = (card: S1IdentityCard, onDone: () => void) => {
  const { t } = useTranslation()
  const mutation = useUpdateEmployee(card.id)

  const form = useForm<IdentityCardFormValues>({
    // zod's inferred input type turns partial when the object carries a refine;
    // the schema still validates presence, so assert the concrete field shape.
    resolver: zodResolver(buildSchema(t)) as Resolver<IdentityCardFormValues>,
    defaultValues: toFormValues(card),
    mode: 'onSubmit',
  })

  const onSubmit = form.handleSubmit(async values => {
    // The card had a birthday and the user emptied both halves: the backend
    // can't clear the pair here, so block it with an inline message.
    const hadBirthday = card.birthDay != null && card.birthMonth != null
    if (hadBirthday && values.birthDay === '' && values.birthMonth === '') {
      form.setError('birthMonth', { message: t('profile.edit.error.birthdayCleared') })
      return
    }

    const payload = changedPayload(card, values)
    if (Object.keys(payload).length === 0) {
      onDone()
      return
    }
    try {
      await mutation.mutateAsync(payload)
      onDone()
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined
      if (status === 409) {
        form.setError('workEmail', { message: t('profile.edit.error.emailConflict') })
        return
      }
      const kind = classifyMutationError(error)
      form.setError('root', { message: t(`profile.edit.error.${kind}`) })
    }
  })

  return {
    form,
    onSubmit,
    isSaving: mutation.isPending,
  }
}
