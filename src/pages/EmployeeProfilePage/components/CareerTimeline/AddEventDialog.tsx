import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAddEventForm } from './hooks/useAddEventForm'

interface AddEventDialogProps {
  employeeId: string
}

export const AddEventDialog = ({ employeeId }: AddEventDialogProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { form, onSubmit, isSubmitting, reset } = useAddEventForm(employeeId, () => setOpen(false))
  const {
    register,
    formState: { errors },
  } = form

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" data-testid="timeline-add-event">
          <Plus className="h-3.5 w-3.5" />
          {t('profile.timeline.addEvent')}
        </Button>
      </DialogTrigger>
      <DialogContent
        // Don't let an Escape / outside click dismiss (and reset) the form
        // mid-flight — a rejected mutation would then `setError` on a gone form.
        onEscapeKeyDown={event => {
          if (isSubmitting) event.preventDefault()
        }}
        onInteractOutside={event => {
          if (isSubmitting) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('profile.timeline.dialog.title')}</DialogTitle>
          <DialogDescription>{t('profile.timeline.dialog.description')}</DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={onSubmit} noValidate>
          <Field data-invalid={Boolean(errors.type)}>
            <FieldLabel htmlFor="add-event-type">
              {t('profile.timeline.dialog.typeLabel')}
            </FieldLabel>
            <Input
              id="add-event-type"
              placeholder={t('profile.timeline.dialog.typePlaceholder')}
              aria-invalid={Boolean(errors.type)}
              disabled={isSubmitting}
              {...register('type')}
            />
            <FieldError errors={errors.type ? [{ message: errors.type.message }] : undefined} />
          </Field>

          <Field data-invalid={Boolean(errors.eventDate)}>
            <FieldLabel htmlFor="add-event-date">
              {t('profile.timeline.dialog.dateLabel')}
            </FieldLabel>
            <Input
              id="add-event-date"
              type="date"
              aria-invalid={Boolean(errors.eventDate)}
              disabled={isSubmitting}
              {...register('eventDate')}
            />
            <FieldError
              errors={errors.eventDate ? [{ message: errors.eventDate.message }] : undefined}
            />
          </Field>

          <Field data-invalid={Boolean(errors.details)}>
            <FieldLabel htmlFor="add-event-details">
              {t('profile.timeline.dialog.detailsLabel')}
            </FieldLabel>
            <Textarea
              id="add-event-details"
              rows={3}
              placeholder={t('profile.timeline.dialog.detailsPlaceholder')}
              aria-invalid={Boolean(errors.details)}
              disabled={isSubmitting}
              {...register('details')}
            />
            <FieldError
              errors={errors.details ? [{ message: errors.details.message }] : undefined}
            />
          </Field>

          {errors.root?.message ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.root.message}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('profile.timeline.dialog.cancel')}
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting
                ? t('profile.timeline.dialog.submitting')
                : t('profile.timeline.dialog.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
