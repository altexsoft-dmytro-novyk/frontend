import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FullPageLoader } from '@/components/FullPageLoader/FullPageLoader'

interface RequireAuthProps {
  children: ReactNode
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <FullPageLoader />
  }

  if (status === 'anonymous') {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />
  }

  return <>{children}</>
}
