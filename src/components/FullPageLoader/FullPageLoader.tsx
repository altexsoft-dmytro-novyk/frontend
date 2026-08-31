import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const FullPageLoader = () => {
  const { t } = useTranslation()
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{t('common.loading')}</span>
      </div>
    </div>
  )
}
