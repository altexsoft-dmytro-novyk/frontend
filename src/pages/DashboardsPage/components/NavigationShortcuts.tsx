import { Link } from 'react-router-dom'
import {
  Users,
  Bookmark,
  Briefcase,
  AlertTriangle,
  GraduationCap,
  Megaphone,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface NavigationShortcutsProps {
  navigation?: {
    allEmployeesUrl: string
    savedViewsUrl: string
    resourcingUrl: string
    riskDashboardUrl: string
    mentorshipHubUrl: string
    campaignsUrl: string
  }
}

export const NavigationShortcuts = ({ navigation }: NavigationShortcutsProps) => {
  const { t } = useTranslation()

  const shortcuts = [
    {
      name: t('dashboards.navigation.allEmployees'),
      url: navigation?.allEmployeesUrl ?? '/employees',
      icon: Users,
    },
    {
      name: t('dashboards.navigation.savedViews'),
      url: navigation?.savedViewsUrl ?? '/employees/views',
      icon: Bookmark,
    },
    {
      name: t('dashboards.navigation.resourcing'),
      url: navigation?.resourcingUrl ?? '/resourcing',
      icon: Briefcase,
    },
    {
      name: t('dashboards.navigation.risks'),
      url: navigation?.riskDashboardUrl ?? '/risks',
      icon: AlertTriangle,
    },
    {
      name: t('dashboards.navigation.mentorship'),
      url: navigation?.mentorshipHubUrl ?? '/mentorship',
      icon: GraduationCap,
    },
    {
      name: t('dashboards.navigation.campaigns'),
      url: navigation?.campaignsUrl ?? '/campaigns',
      icon: Megaphone,
    },
  ]

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {t('dashboards.navigation.title')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {shortcuts.map(s => {
            const Icon = s.icon
            return (
              <Link
                key={s.name}
                to={s.url}
                className="flex items-center gap-2 rounded-lg border border-border bg-background p-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                <span className="truncate">{s.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
