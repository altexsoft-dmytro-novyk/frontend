import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Route guard for the authenticated app shell. Renders the nested routes when a
 * session is present, otherwise sends the visitor to /login.
 */
export const RequireAuth = () => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
