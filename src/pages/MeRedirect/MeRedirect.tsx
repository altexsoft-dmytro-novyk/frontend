import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FullPageLoader } from '@/components/FullPageLoader/FullPageLoader'

/** `/me` → the signed-in user's own profile. */
export const MeRedirect = () => {
  const { me } = useAuth()
  if (!me) return <FullPageLoader />
  return <Navigate to={`/people/${me.id}`} replace />
}
