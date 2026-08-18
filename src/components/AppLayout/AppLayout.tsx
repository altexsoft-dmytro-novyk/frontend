import { Outlet } from 'react-router-dom'
import { MainLayout } from '@/components/MainLayout/MainLayout'

export const AppLayout = () => {
  return (
    <MainLayout showSidebar={true} sidebarCollapsible={true}>
      <Outlet />
    </MainLayout>
  )
}
