import { useLayout } from '@/contexts/LayoutContext'
import { SideMenuItem } from './components/SideMenuItem/SideMenuItem'
import { SideMenuToggle } from './components/SideMenuToggle/SideMenuToggle'
import { useSideMenuNav } from './hooks/useSideMenuNav'
import { cn } from '@/lib/utils'

interface SideMenuProps {
  collapsible?: boolean
  expanded: boolean
}

export const SideMenu = ({ collapsible = true, expanded }: SideMenuProps) => {
  const { toggleSidebar, isMobileSidebarOpen, closeMobileSidebar } = useLayout()
  const navItems = useSideMenuNav()
  // The mobile drawer is always full width, so labels must show there even when
  // the desktop sidebar is collapsed.
  const showLabels = expanded || isMobileSidebarOpen

  return (
    <>
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
          'fixed inset-y-0 left-0 z-50 w-64 -translate-x-full transition-transform duration-200 ease-in-out',
          isMobileSidebarOpen && 'translate-x-0',
          'md:relative md:inset-auto md:z-auto md:translate-x-0 md:w-auto md:transition-[width] md:duration-200 md:ease-in-out',
          expanded ? 'md:w-[var(--sidebar-width)]' : 'md:w-[var(--sidebar-collapsed-width)]'
        )}
      >
        <nav className="flex-1 py-2">
          {navItems.map(item => (
            <SideMenuItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              path={item.path}
              hint={item.label}
              expanded={showLabels}
              onNavigate={closeMobileSidebar}
            />
          ))}
        </nav>

        {collapsible && (
          <div className="hidden md:block">
            <SideMenuToggle expanded={expanded} onToggle={toggleSidebar} />
          </div>
        )}
      </aside>
    </>
  )
}
