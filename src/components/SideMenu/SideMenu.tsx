import type { ParseKeys } from 'i18next'
import { Home, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLayout } from '@/contexts/LayoutContext'
import { SideMenuItem } from './components/SideMenuItem/SideMenuItem'
import { SideMenuSection } from './components/SideMenuSection/SideMenuSection'
import { SideMenuToggle } from './components/SideMenuToggle/SideMenuToggle'
import { cn } from '@/lib/utils'

interface SideMenuProps {
  collapsible?: boolean
  expanded: boolean
}

interface NavItem {
  icon: LucideIcon
  labelKey: ParseKeys
  path: string
  end?: boolean
}

interface NavSection {
  /** Uppercase group heading (prototype "Administration" treatment). Untitled = top group. */
  title?: string
  items: NavItem[]
}

/**
 * G1 renders only the Home item, in the untitled top group. Grouped sections are
 * wired so later epics (directory, admin screens) drop a `title` + items in
 * without a refactor — the sidebar only ever shows live nav items, never placeholders.
 */
const NAV_SECTIONS: NavSection[] = [
  { items: [{ icon: Home, labelKey: 'sidebar.home', path: '/', end: true }] },
]

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
          'flex flex-col overflow-auto border-r border-sidebar-border bg-sidebar',
          // Mobile: fixed off-canvas drawer, slides in from the left
          'fixed inset-y-0 left-0 z-50 w-64 -translate-x-full transition-transform duration-200 ease-in-out',
          isMobileSidebarOpen && 'translate-x-0',
          // Desktop: back to being a normal in-flow column with variable width
          'md:relative md:inset-auto md:z-auto md:translate-x-0 md:w-auto md:transition-[width] md:duration-200 md:ease-in-out',
          expanded ? 'md:w-[var(--sidebar-width)]' : 'md:w-[var(--sidebar-collapsed-width)]'
        )}
      >
        <nav className="flex flex-1 flex-col gap-1 py-2">
          {NAV_SECTIONS.map((section, index) => (
            <SideMenuSection
              key={section.title ?? index}
              title={section.title}
              showLabels={showLabels}
            >
              {section.items.map(item => (
                <SideMenuItem
                  key={item.path}
                  icon={item.icon}
                  label={t(item.labelKey)}
                  path={item.path}
                  hint={t(item.labelKey)}
                  end={item.end}
                  expanded={showLabels}
                  onNavigate={closeMobileSidebar}
                />
              ))}
            </SideMenuSection>
          ))}
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
