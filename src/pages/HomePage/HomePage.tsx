import { useTranslation } from 'react-i18next'

export const HomePage = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* Page-header band (prototype system move 2): mono eyebrow, title, lead, accent tick + rule. */}
      <div className="border-t-[length:var(--page-band-tick)] border-b border-t-primary border-b-border pb-4">
        <p className="font-mono text-[0.7rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {t('home.eyebrow')}
        </p>
        <h1 className="mt-2 text-xl font-semibold text-foreground" data-testid="home-title">
          {t('home.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('home.lead')}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">{t('home.description')}</p>
      </div>
    </div>
  )
}
