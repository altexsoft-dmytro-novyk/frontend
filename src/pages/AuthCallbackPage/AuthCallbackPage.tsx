import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthCallback } from './hooks/useAuthCallback'

export const AuthCallbackPage = () => {
  const { t } = useTranslation()
  const { failed } = useAuthCallback()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        {failed ? (
          <>
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 text-destructive">
                <TriangleAlert className="h-5 w-5" />
                <CardTitle>{t('auth.callbackFailedTitle')}</CardTitle>
              </div>
              <CardDescription>{t('auth.callbackFailedBody')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/login">{t('auth.requestNewLink')}</Link>
              </Button>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center gap-3 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t('auth.callbackWorking')}</span>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
