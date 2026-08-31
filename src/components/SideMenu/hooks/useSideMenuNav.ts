import { useMemo } from 'react'
import { Shield, User, Users, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'

export interface SideMenuNavItem {
  key: string
  icon: LucideIcon
  label: string
  path: string
  end?: boolean
}

export const useSideMenuNav = (): SideMenuNavItem[] => {
  const { t } = useTranslation()
  const { me, can } = useAuth()

  return useMemo(() => {
    const items: SideMenuNavItem[] = [
      { key: 'people', icon: Users, label: t('nav.people'), path: '/people' },
    ]
    if (me) {
      items.push({ key: 'me', icon: User, label: t('nav.myProfile'), path: `/people/${me.id}` })
    }
    if (can('manage_roles')) {
      items.push({ key: 'roles', icon: Shield, label: t('nav.roles'), path: '/admin/roles' })
    }
    return items
  }, [t, me, can])
}
