import { LogOut, Menu, Search, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useLayout } from '@/contexts/LayoutContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCommandMenu } from '@/contexts/CommandMenuContext'
import { UserAvatar } from '@/components/UserAvatar/UserAvatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Logo } from './components/Logo/Logo'

interface MainHeaderProps {
  showMenuButton?: boolean
}

export const MainHeader = ({ showMenuButton = false }: MainHeaderProps) => {
  const { t } = useTranslation()
  const { openMobileSidebar } = useLayout()
  const { me, signOut } = useAuth()
  const { setOpen } = useCommandMenu()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header
      className="flex items-center justify-between gap-2 border-b border-sidebar-border bg-sidebar pr-3"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex items-center">
        {showMenuButton && (
          <button
            onClick={openMobileSidebar}
            className="flex h-full items-center px-3 text-sidebar-foreground transition-colors hover:bg-sidebar-accent md:hidden"
            aria-label={t('nav.openMenu')}
            data-testid="mobile-menu-button"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Logo />
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          aria-label={t('nav.commandHint')}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">{t('nav.commandHint')}</span>
          <kbd className="hidden rounded bg-muted px-1.5 text-xs sm:inline">⌘K</kbd>
        </button>

        {me && (
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none ring-ring focus-visible:ring-2">
              <UserAvatar firstName={me.firstName} lastName={me.lastName} photo={me.photo} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">
                {me.firstName} {me.lastName}
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {me.workEmail}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/people/${me.id}`}>
                  <User className="h-4 w-4" />
                  {t('nav.myProfile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleSignOut}>
                <LogOut className="h-4 w-4" />
                {t('nav.signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
