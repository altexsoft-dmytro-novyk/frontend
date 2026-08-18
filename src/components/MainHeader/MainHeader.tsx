import { Menu } from 'lucide-react'
import { useLayout } from '@/contexts/LayoutContext'
import { Logo } from './components/Logo/Logo'

interface MainHeaderProps {
  showMenuButton?: boolean
}

export const MainHeader = ({ showMenuButton = false }: MainHeaderProps) => {
  const { openMobileSidebar } = useLayout()

  return (
    <header
      className="flex items-center justify-between border-b border-sidebar-border bg-sidebar"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex items-center">
        {showMenuButton && (
          <button
            onClick={openMobileSidebar}
            className="flex h-full items-center px-3 text-sidebar-foreground hover:bg-sidebar-accent transition-colors md:hidden"
            aria-label="Open menu"
            data-testid="mobile-menu-button"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Logo />
      </div>
    </header>
  )
}
