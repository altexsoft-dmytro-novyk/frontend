import { Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLayout } from '@/contexts/LayoutContext'
import { SideMenuItem } from './components/SideMenuItem/SideMenuItem'
import { SideMenuToggle } from './components/SideMenuToggle/SideMenuToggle'
import { cn } from '@/lib/utils'

interface SideMenuProps {
  collapsible?: boolean
  expanded: boolean
}

export const SideMenu = ({ collapsible = true, expanded }: SideMenuProps) => {
  const { t } = useTranslation()
  const { toggleSidebar, isMobileSidebarOpen, closeMobileSidebar } = useLayout()
  // The mobile drawer is always rendered at full width, so labels must be
  // visible there even if the desktop sidebar is currently collapsed.
  const showLabels = expanded || isMobileSidebarOpen

  return (
    <>
      {/* Backdrop for the mobile off-canvas drawer */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'flex flex-col border-r border-sidebar-border bg-sidebar overflow-auto',
          // Mobile: fixed off-canvas drawer, slides in from the left
          'fixed inset-y-0 left-0 z-50 w-64 -translate-x-full transition-transform duration-200 ease-in-out',
          isMobileSidebarOpen && 'translate-x-0',
          // Desktop: back to being a normal in-flow column with variable width
          'md:relative md:inset-auto md:z-auto md:translate-x-0 md:w-auto md:transition-[width] md:duration-200 md:ease-in-out',
          expanded ? 'md:w-[var(--sidebar-width)]' : 'md:w-[var(--sidebar-collapsed-width)]'
        )}
      >
        <nav className="flex-1 py-2">
          <SideMenuItem
            icon={Home}
            label={t('sidebar.home')}
            path="/"
            hint={t('sidebar.home')}
            expanded={showLabels}
            onNavigate={closeMobileSidebar}
          />
        </nav>

        {/* Desktop-only collapse/expand toggle; mobile uses the header hamburger + backdrop instead */}
        {collapsible && (
          <div className="hidden md:block">
            <SideMenuToggle expanded={expanded} onToggle={toggleSidebar} />
          </div>
        )}
      </aside>
    </>
  )
}
