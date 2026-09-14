import { ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const AccessDeniedPanel = () => {
  const { t } = useTranslation()

  return (
    <div
      data-testid="access-denied-panel"
      className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-12 text-center my-8"
    >
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <ShieldAlert className="h-8 w-8 text-destructive" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">
        {t('dashboards.accessDenied.title')}
      </h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        {t('dashboards.accessDenied.description')}
      </p>
    </div>
  )
}
