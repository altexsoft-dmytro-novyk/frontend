import { useTranslation } from 'react-i18next'
import { Home } from 'lucide-react'

export const HomePage = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <Home className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold text-foreground" data-testid="home-title">
          {t('home.title')}
        </h1>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <p className="text-muted-foreground">{t('home.description')}</p>
      </div>
    </div>
  )
}
