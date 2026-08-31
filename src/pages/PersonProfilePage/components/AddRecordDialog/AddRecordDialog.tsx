import { useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface AddRecordDialogProps {
  title: string
  triggerLabel?: string
  disabled?: boolean
  busy?: boolean
  canSubmit?: boolean
  onSubmit: () => Promise<boolean>
  children: ReactNode
}

/** Small "+ Add" button that opens a dialog; closes only when `onSubmit` resolves true. */
export const AddRecordDialog = ({
  title,
  triggerLabel,
  disabled,
  busy,
  canSubmit = true,
  onSubmit,
  children,
}: AddRecordDialogProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const submit = async () => {
    const ok = await onSubmit()
    if (ok) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled}>
          <Plus className="h-3.5 w-3.5" />
          {triggerLabel ?? t('common.add')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={busy || !canSubmit}>
            {t('common.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
