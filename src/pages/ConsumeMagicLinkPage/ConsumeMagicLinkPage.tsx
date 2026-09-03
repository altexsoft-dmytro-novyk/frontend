import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2, TriangleAlert } from 'lucide-react'
import { useConsumeMagicLinkPage } from './hooks/useConsumeMagicLinkPage'

export const ConsumeMagicLinkPage = () => {
  const { t } = useTranslation()
  const { status, redirectHome } = useConsumeMagicLinkPage()

  if (redirectHome) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center text-card-foreground shadow-sm">
        {status === 'verifying' ? (
          <div className="space-y-3" data-testid="consume-verifying" role="status">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('auth.consume.verifying')}</p>
          </div>
        ) : (
          <div className="space-y-3" data-testid="consume-error">
            <TriangleAlert className="mx-auto h-6 w-6 text-destructive" />
            <h1 className="text-base font-semibold">{t('auth.consume.errorTitle')}</h1>
            <p className="text-sm text-muted-foreground">{t('auth.consume.errorBody')}</p>
            <Link
              to="/login"
              className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t('auth.consume.backToLogin')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
