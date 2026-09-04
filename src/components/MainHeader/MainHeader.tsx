import { Bell, Menu, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLayout } from '@/contexts/LayoutContext'
import { Logo } from './components/Logo/Logo'
import { AccountMenu } from './components/AccountMenu/AccountMenu'

interface MainHeaderProps {
  showMenuButton?: boolean
}

export const MainHeader = ({ showMenuButton = false }: MainHeaderProps) => {
  const { t } = useTranslation()
  const { openMobileSidebar } = useLayout()

  return (
    <header
      className="flex items-center gap-3 border-b border-sidebar-border bg-sidebar px-3"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex items-center">
        {showMenuButton && (
          <button
            onClick={openMobileSidebar}
            className="flex h-full items-center px-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent md:hidden"
            aria-label="Open menu"
            data-testid="mobile-menu-button"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Logo />
      </div>

      {/* Global search — visual only in G1 (no directory to search yet). */}
      <div className="mx-auto hidden w-full max-w-md items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-muted-foreground md:flex">
        <Search className="h-4 w-4 shrink-0" />
        <input
          type="search"
          disabled
          aria-label={t('shell.searchPlaceholder')}
          placeholder={t('shell.searchPlaceholder')}
          className="h-8 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 md:ml-0">
        {/* Notifications — visual only in G1 (nothing raises them yet). */}
        <button
          type="button"
          disabled
          aria-label={t('shell.notifications')}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground"
        >
          <Bell className="h-4 w-4" />
        </button>
        <AccountMenu />
      </div>
    </header>
  )
}
