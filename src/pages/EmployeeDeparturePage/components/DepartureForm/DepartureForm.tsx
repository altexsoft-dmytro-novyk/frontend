import { useEffect, useRef } from 'react'
import { Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatIsoDate } from '@/lib/employeeFormatters'
import { todayIsoDate } from '@/lib/datetime'
import type { BlockedDepartureResponse, DepartureView, RecordDeparturePayload } from '@/types/api'
import { useDepartureForm } from './hooks/useDepartureForm'

const REASON_MAX = 2000

interface DepartureFormProps {
  routeId: string
  subjectName: string
  canWrite: boolean
  onWriteForbidden: () => void
  onRecorded: (view: DepartureView) => boolean
  onBlocked: (response: BlockedDepartureResponse, payload: RecordDeparturePayload) => void
  idempotencyKeyFor: (payload: RecordDeparturePayload) => string
}

export const DepartureForm = ({
  routeId,
  subjectName,
  canWrite,
  onWriteForbidden,
  onRecorded,
  onBlocked,
  idempotencyKeyFor,
}: DepartureFormProps) => {
  const { t } = useTranslation()
  const { form, onSubmit, confirmValues, confirmSubmit, cancelConfirm, isSubmitting } =
    useDepartureForm({ routeId, onWriteForbidden, onRecorded, onBlocked, idempotencyKeyFor })
  const {
    register,
    formState: { errors },
  } = form

  const noticeRef = useRef<HTMLParagraphElement>(null)
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (!canWrite) {
      noticeRef.current?.focus()
    }
  }, [canWrite])

  const disabled = isSubmitting || !canWrite

  return (
    <section
      className="rounded-lg border border-border bg-card p-4 sm:p-5"
      data-testid="departure-form"
    >
      <h2
        id="departure-phase-heading"
        tabIndex={-1}
        className="text-sm font-semibold text-foreground outline-none"
      >
        {t('departure.form.title')}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t('departure.form.description')}</p>

      {!canWrite ? (
        <p
          ref={noticeRef}
          tabIndex={-1}
          className="mt-3 flex items-center gap-2 text-sm text-muted-foreground outline-none"
          data-testid="departure-permission-notice"
          role="status"
        >
          <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t('departure.permissionNotice')}
        </p>
      ) : null}

      <form className="mt-4 space-y-3" onSubmit={onSubmit} noValidate>
        <Field data-invalid={Boolean(errors.effectiveDate)}>
          <FieldLabel htmlFor="departure-effective-date">
            {t('departure.form.effectiveDateLabel')}
          </FieldLabel>
          <Input
            id="departure-effective-date"
            type="date"
            min={todayIsoDate()}
            aria-invalid={Boolean(errors.effectiveDate)}
            disabled={disabled}
            {...register('effectiveDate')}
          />
          <FieldError
            errors={errors.effectiveDate ? [{ message: errors.effectiveDate.message }] : undefined}
          />
        </Field>

        <Field data-invalid={Boolean(errors.reason)}>
          <FieldLabel htmlFor="departure-reason">{t('departure.form.reasonLabel')}</FieldLabel>
          <Textarea
            id="departure-reason"
            rows={3}
            maxLength={REASON_MAX}
            placeholder={t('departure.form.reasonPlaceholder')}
            aria-invalid={Boolean(errors.reason)}
            disabled={disabled}
            {...register('reason')}
          />
          <FieldError errors={errors.reason ? [{ message: errors.reason.message }] : undefined} />
        </Field>

        {errors.root?.message ? (
          <p className="text-sm text-destructive" role="alert" data-testid="departure-form-error">
            {errors.root.message}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={disabled} data-testid="departure-submit">
            {isSubmitting ? t('departure.form.submitting') : t('departure.form.submit')}
          </Button>
        </div>
      </form>

      <AlertDialog
        open={confirmValues !== null}
        onOpenChange={next => (next ? undefined : cancelConfirm())}
      >
        <AlertDialogContent data-testid="departure-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('departure.confirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('departure.confirm.body', {
                name: subjectName,
                date: confirmValues ? formatIsoDate(confirmValues.effectiveDate) : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              {t('departure.confirm.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={event => {
                event.preventDefault()
                void confirmSubmit()
              }}
              data-testid="departure-confirm-submit"
            >
              {t('departure.confirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
