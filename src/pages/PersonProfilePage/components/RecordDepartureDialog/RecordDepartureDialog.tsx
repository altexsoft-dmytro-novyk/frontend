import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { httpStatus } from '@/api/client'
import { useRecordDeparture } from '@/api/hooks/useRelationships'
import { formatDate } from '@/helpers/format'

interface RecordDepartureDialogProps {
  id: string
}

export const RecordDepartureDialog = ({ id }: RecordDepartureDialogProps) => {
  const { t } = useTranslation()
  const record = useRecordDeparture(id)
  const [open, setOpen] = useState(false)
  const [effectiveDate, setEffectiveDate] = useState('')
  const [reason, setReason] = useState('')
  const [blocked, setBlocked] = useState(false)

  const submit = async () => {
    setBlocked(false)
    try {
      await record.mutateAsync({ effectiveDate, reason: reason.trim() || undefined })
      toast.success(t('departure.recorded', { date: formatDate(effectiveDate) }))
      setOpen(false)
    } catch (error) {
      const status = httpStatus(error)
      if (status === 409) setBlocked(true)
      else if (status === 400) toast.error(t('departure.invalidDate'))
      else if (status === 403) toast.error(t('common.noPermission'))
      else toast.error(t('common.somethingWentWrong'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive">
          <LogOut className="h-3.5 w-3.5" />
          {t('departure.trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('departure.title')}</DialogTitle>
          <DialogDescription>{t('departure.reason')}</DialogDescription>
        </DialogHeader>

        {blocked && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
            <p className="font-medium text-destructive">{t('departure.blockedTitle')}</p>
            <p className="text-muted-foreground">{t('departure.blockedBody')}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="dep-date">{t('departure.effectiveDate')}</Label>
            <Input
              id="dep-date"
              type="date"
              value={effectiveDate}
              onChange={e => setEffectiveDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dep-reason">{t('departure.reason')}</Label>
            <Textarea id="dep-reason" value={reason} onChange={e => setReason(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            disabled={record.isPending || !effectiveDate}
            onClick={() => void submit()}
          >
            {t('departure.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
