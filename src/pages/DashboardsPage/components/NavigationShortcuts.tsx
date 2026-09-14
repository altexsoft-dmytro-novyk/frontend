import { Link } from 'react-router-dom'
import {
  Users,
  Bookmark,
  Briefcase,
  AlertTriangle,
  GraduationCap,
  Megaphone,
  UserMinus,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface NavigationShortcutsProps {
  navigation?: {
    allEmployeesUrl: string
    savedViewsUrl: string
    resourcingUrl?: string
    riskDashboardUrl?: string
    mentorshipHubUrl?: string
    campaignsUrl: string
    departuresUrl?: string
  }
}

export const NavigationShortcuts = ({ navigation }: NavigationShortcutsProps) => {
  const { t } = useTranslation()

  const shortcuts = []

  if (navigation?.allEmployeesUrl) {
    shortcuts.push({
      name: t('dashboards.navigation.allEmployees'),
      url: navigation.allEmployeesUrl,
      icon: Users,
    })
  }

  if (navigation?.savedViewsUrl) {
    shortcuts.push({
      name: t('dashboards.navigation.savedViews'),
      url: navigation.savedViewsUrl,
      icon: Bookmark,
    })
  }

  if (navigation?.resourcingUrl) {
    shortcuts.push({
      name: t('dashboards.navigation.resourcing'),
      url: navigation.resourcingUrl,
      icon: Briefcase,
    })
  }

  if (navigation?.riskDashboardUrl) {
    shortcuts.push({
      name: t('dashboards.navigation.risks'),
      url: navigation.riskDashboardUrl,
      icon: AlertTriangle,
    })
  }

  if (navigation?.mentorshipHubUrl) {
    shortcuts.push({
      name: t('dashboards.navigation.mentorship'),
      url: navigation.mentorshipHubUrl,
      icon: GraduationCap,
    })
  }

  if (navigation?.campaignsUrl) {
    shortcuts.push({
      name: t('dashboards.navigation.campaigns'),
      url: navigation.campaignsUrl,
      icon: Megaphone,
    })
  }

  if (navigation?.departuresUrl) {
    shortcuts.push({
      name: t('dashboards.navigation.departures'),
      url: navigation.departuresUrl,
      icon: UserMinus,
    })
  }

  return (
    <div
      data-slot="navigationShortcuts"
      className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs"
    >
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
