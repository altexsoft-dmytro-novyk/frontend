import { useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { useEmployee } from '@/api/hooks/useEmployee'
import { useAuth } from '@/contexts/AuthContext'
import type { S1IdentityCard } from '@/types/api'

export type EmployeeProfileStatus = 'loading' | 'ready' | 'unavailable' | 'error'

interface EmployeeProfilePageState {
  routeId: string
  isOwnProfile: boolean
  status: EmployeeProfileStatus
  card: S1IdentityCard | null
  canEdit: boolean
  refetch: () => void
}

/**
 * Screen state for `/employees/:id`. `useEmployee` drives everything; `canEdit`
 * comes straight from the response — the UI never re-derives access.
 *
 * An empty route id, a `403` (empty S1 audience over the target, a nonexistent
 * id included) and a `404` all collapse to `unavailable`; a `5xx` / transport
 * failure — or a `200` whose body is missing `data` — is `error` (with a retry).
 * `401` never reaches here — the client interceptor redirects first.
 */
export const useEmployeeProfilePage = (): EmployeeProfilePageState => {
  const { id = '' } = useParams<{ id: string }>()
  const { userId } = useAuth()
  const query = useEmployee(id)

  const errorStatus = isAxiosError(query.error) ? query.error.response?.status : undefined
  const card = query.data?.data ?? null

  let status: EmployeeProfileStatus
  if (id === '') {
    status = 'unavailable'
  } else if (query.isError) {
    status = errorStatus === 403 || errorStatus === 404 ? 'unavailable' : 'error'
  } else if (query.isLoading) {
    status = 'loading'
  } else if (query.isSuccess && card === null) {
    // A 200 that carries no `data` object is a broken response, not a profile.
    status = 'error'
  } else {
    status = 'ready'
  }

  return {
    routeId: id,
    isOwnProfile: userId !== null && userId === id,
    status,
    card,
    canEdit: query.data?.canEdit ?? false,
    refetch: () => {
      void query.refetch()
    },
  }
}
