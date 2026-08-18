/**
 * Generic application error page
 */

import { useTranslation } from 'react-i18next'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useErrorPage } from './hooks/useErrorPage'

export const ErrorPage = () => {
  const { t } = useTranslation()
  const { error, handleReload } = useErrorPage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto" />

        <h1 className="text-2xl font-bold text-foreground" data-testid="error-title">
          {t('error.title')}
        </h1>

        <div className="space-y-2">
          <p className="text-muted-foreground">{t('error.description')}</p>

          {error && (
            <div className="p-3 bg-muted rounded-md border border-border">
              <p className="text-sm text-muted-foreground">{t('error.errorDetails')}</p>
              <p className="text-sm font-mono text-foreground mt-1">{error}</p>
            </div>
          )}
        </div>

        <Button onClick={handleReload} className="gap-2" data-testid="error-reload-button">
          <RotateCcw className="h-4 w-4" />
          {t('error.reload')}
        </Button>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">{t('error.footer')}</p>
        </div>
      </div>
    </div>
  )
}
