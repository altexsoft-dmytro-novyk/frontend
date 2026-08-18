import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

/* eslint-disable react-refresh/only-export-components */

interface LayoutContextValue {
  sidebarExpanded: boolean
  toggleSidebar: () => void
  // Mobile sidebar is an off-canvas drawer, tracked separately from the
  // desktop collapse/expand state above.
  isMobileSidebarOpen: boolean
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined)

const SIDEBAR_STORAGE_KEY = 'sidebar-expanded'

interface LayoutProviderProps {
  children: ReactNode
}

export const LayoutProvider = ({ children }: LayoutProviderProps) => {
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    return stored ? stored === 'true' : true
  })

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarExpanded))
  }, [sidebarExpanded])

  const toggleSidebar = () => {
    setSidebarExpanded(prev => !prev)
  }

  const openMobileSidebar = () => setIsMobileSidebarOpen(true)
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false)

  return (
    <LayoutContext.Provider
      value={{
        sidebarExpanded,
        toggleSidebar,
        isMobileSidebarOpen,
        openMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider')
  }
  return context
}
