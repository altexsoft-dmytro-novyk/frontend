import { Outlet } from 'react-router-dom'
import { MainLayout } from '@/components/MainLayout/MainLayout'
import { CommandPalette } from '@/components/CommandPalette/CommandPalette'

export const AppLayout = () => {
  return (
    <MainLayout showSidebar={true} sidebarCollapsible={true}>
      <CommandPalette />
      <Outlet />
    </MainLayout>
  )
}
