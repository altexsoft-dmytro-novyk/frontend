import type { ParseKeys } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { S1IdentityCard } from '@/types/api'
import { useIdentityCardForm, type IdentityCardFormValues } from './hooks/useIdentityCardForm'

interface IdentityCardFormProps {
  card: S1IdentityCard
  onDone: () => void
}

interface FieldConfig {
  name: keyof IdentityCardFormValues
  labelKey: ParseKeys
  type?: 'text' | 'email' | 'tel' | 'number' | 'date'
  min?: number
  max?: number
}

const FIELDS: FieldConfig[] = [
  { name: 'firstName', labelKey: 'profile.card.fields.firstName' },
  { name: 'lastName', labelKey: 'profile.card.fields.lastName' },
  { name: 'position', labelKey: 'profile.card.fields.position' },
  { name: 'country', labelKey: 'profile.card.fields.country' },
  { name: 'city', labelKey: 'profile.card.fields.city' },
  { name: 'workEmail', labelKey: 'profile.card.fields.workEmail', type: 'email' },
  { name: 'workPhone', labelKey: 'profile.card.fields.workPhone', type: 'tel' },
  { name: 'birthDay', labelKey: 'profile.card.fields.birthDay', type: 'number', min: 1, max: 31 },
  {
    name: 'birthMonth',
    labelKey: 'profile.card.fields.birthMonth',
    type: 'number',
    min: 1,
    max: 12,
  },
  { name: 'companyJoinDate', labelKey: 'profile.card.fields.companyJoinDate', type: 'date' },
]

export const IdentityCardForm = ({ card, onDone }: IdentityCardFormProps) => {
  const { t } = useTranslation()
  const { form, onSubmit, isSaving } = useIdentityCardForm(card, onDone)
  const {
    register,
    formState: { errors },
  } = form

  return (
    <form className="mt-3 space-y-4" onSubmit={onSubmit} noValidate data-testid="profile-edit-form">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FIELDS.map(field => {
          const inputId = `profile-field-${field.name}`
          const fieldError = errors[field.name]
          return (
            <Field key={field.name} data-invalid={Boolean(fieldError)}>
              <FieldLabel htmlFor={inputId}>{t(field.labelKey)}</FieldLabel>
              <Input
                id={inputId}
                type={field.type ?? 'text'}
                inputMode={field.type === 'number' ? 'numeric' : undefined}
                min={field.min}
                max={field.max}
                aria-invalid={Boolean(fieldError)}
                disabled={isSaving}
                {...register(field.name)}
              />
              <FieldError errors={fieldError ? [{ message: fieldError.message }] : undefined} />
            </Field>
          )
        })}
      </div>

      {errors.root?.message ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.root.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? t('profile.edit.saving') : t('profile.edit.save')}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={isSaving}>
          {t('profile.edit.cancel')}
        </Button>
      </div>
    </form>
  )
}
