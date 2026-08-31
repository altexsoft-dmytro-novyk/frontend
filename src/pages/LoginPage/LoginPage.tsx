import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { MailCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useLoginPage } from './hooks/useLoginPage'

export const LoginPage = () => {
  const { t } = useTranslation()
  const { status } = useAuth()
  const { form, onSubmit, reset, sentTo, isSubmitting } = useLoginPage()

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-6 w-6" />
            <span className="text-lg font-semibold text-foreground">People</span>
          </div>
          <CardTitle>{sentTo ? t('auth.linkSentTitle') : t('auth.signInTitle')}</CardTitle>
          <CardDescription>
            {sentTo ? t('auth.linkSentBody', { email: sentTo }) : t('auth.signInSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sentTo ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted p-3 text-sm text-muted-foreground">
                <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{t('auth.devHint')}</span>
              </div>
              <Button variant="outline" className="w-full" onClick={reset}>
                {t('auth.backToSignIn')}
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder={t('auth.emailPlaceholder')}
                  aria-invalid={Boolean(form.formState.errors.email)}
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t('auth.sending') : t('auth.sendLink')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
