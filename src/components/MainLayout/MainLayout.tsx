import { type ReactNode } from 'react'
import { useLayout } from '@/contexts/LayoutContext'
import { MainHeader } from '../MainHeader/MainHeader'
import { SideMenu } from '../SideMenu/SideMenu'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: ReactNode
  showSidebar?: boolean
  sidebarCollapsible?: boolean
}

export const MainLayout = ({
  children,
  showSidebar = false,
  sidebarCollapsible = true,
}: MainLayoutProps) => {
  const { sidebarExpanded } = useLayout()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <MainHeader showMenuButton={showSidebar} />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <SideMenu collapsible={sidebarCollapsible} expanded={sidebarExpanded} />}
        <main
          className={cn(
            'flex-1 overflow-auto p-4 md:p-8',
            'transition-all duration-200 ease-in-out'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
