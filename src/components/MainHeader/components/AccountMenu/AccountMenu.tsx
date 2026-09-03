import { LogOut, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Header avatar + dropdown. G1 has no employee name/profile, so the avatar is a
 * generic glyph and the menu just shows "Signed in" + "Sign out".
 */
export const AccountMenu = () => {
  const { t } = useTranslation()
  const { logout } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('shell.accountMenu')}
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-testid="account-menu-trigger"
      >
        <Avatar size="sm">
          <AvatarFallback>
            <User className="h-3.5 w-3.5" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>{t('shell.signedIn')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} data-testid="sign-out">
          <LogOut className="h-4 w-4" />
          {t('shell.signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
