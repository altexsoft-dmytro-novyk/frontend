import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpStatus } from '@/api/client'

interface RunOptions {
  onConflict?: () => void
  conflictMessage?: string
  successMessage?: string
}

/**
 * Wraps a section mutation. The backend only reveals "you can read but not
 * write" as a `403` at write time, so we run optimistically and, on `403`,
 * flip `denied` (the panel then hides its edit controls for the session).
 */
export const useSectionWrite = () => {
  const { t } = useTranslation()
  const [denied, setDenied] = useState(false)
  const [busy, setBusy] = useState(false)

  const run = async <T>(action: () => Promise<T>, options: RunOptions = {}): Promise<T | null> => {
    setBusy(true)
    try {
      const result = await action()
      if (options.successMessage) toast.success(options.successMessage)
      return result
    } catch (error) {
      const status = httpStatus(error)
      if (status === 403) {
        setDenied(true)
        toast.error(t('common.noPermission'))
      } else if (status === 409) {
        toast.error(options.conflictMessage ?? t('common.somethingWentWrong'))
        options.onConflict?.()
      } else {
        toast.error(t('common.somethingWentWrong'))
      }
      return null
    } finally {
      setBusy(false)
    }
  }

  return { denied, busy, run }
}
