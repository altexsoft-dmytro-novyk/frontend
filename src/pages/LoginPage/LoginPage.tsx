import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MailCheck } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark/BrandMark'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useLoginPage } from './hooks/useLoginPage'

export const LoginPage = () => {
  const { t } = useTranslation()
  const { form, onSubmit, isAuthenticated, isSubmitted, isSubmitting, hasError, resetToForm } =
    useLoginPage()
  const {
    register,
    formState: { errors },
  } = form

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div className="border-l-2 border-provenance-platform pl-2.5">
          <p className="font-mono text-[0.7rem] font-medium tracking-[0.08em] text-provenance-platform uppercase">
            {t('auth.provenanceTag')}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <BrandMark />
        </div>

        {isSubmitted ? (
          <div className="mt-6 space-y-3" data-testid="login-confirmation" role="status">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <MailCheck className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-semibold">{t('auth.login.checkInboxTitle')}</h1>
            <p className="text-sm text-muted-foreground">{t('auth.login.checkInboxBody')}</p>
            <Button variant="ghost" size="sm" onClick={resetToForm} className="px-0">
              {t('auth.login.backToForm')}
            </Button>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <h1 className="text-lg font-semibold">{t('auth.login.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('auth.login.lead')}</p>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="login-email">{t('auth.login.emailLabel')}</FieldLabel>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder={t('auth.login.emailPlaceholder')}
                aria-invalid={Boolean(errors.email)}
                disabled={isSubmitting}
                {...register('email')}
              />
              <FieldError errors={errors.email ? [{ message: errors.email.message }] : undefined} />
            </Field>

            {hasError && (
              <p className="text-sm text-destructive" role="alert">
                {t('auth.login.genericError')}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
