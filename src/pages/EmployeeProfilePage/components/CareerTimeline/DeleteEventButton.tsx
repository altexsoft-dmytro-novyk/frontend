import { useState } from 'react'
import { Trash2 } from 'lucide-react'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useDeleteCareerEvent } from '@/api/hooks/useDeleteCareerEvent'
import { classifyMutationError } from '../../helpers/mutationError'

interface DeleteEventButtonProps {
  employeeId: string
  eventId: string
}

export const DeleteEventButton = ({ employeeId, eventId }: DeleteEventButtonProps) => {
  const { t } = useTranslation()
  const mutation = useDeleteCareerEvent(employeeId)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    setError(null)
    try {
      await mutation.mutateAsync(eventId)
      setOpen(false)
    } catch (caught) {
      // The list is unchanged; surface an inline error. `403`/`404` (gone or
      // access changed) reads differently from a transient failure.
      setOpen(false)
      setError(
        classifyMutationError(caught) === 'permission'
          ? t('profile.timeline.deleteError.permission')
          : t('profile.timeline.deleteError.transient')
      )
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t('profile.timeline.deleteRow')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('profile.timeline.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('profile.timeline.deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>
              {t('profile.timeline.deleteDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={mutation.isPending}
              onClick={event => {
                event.preventDefault()
                void confirm()
              }}
            >
              {t('profile.timeline.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
