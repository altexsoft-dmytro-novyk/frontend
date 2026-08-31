import { useParams } from 'react-router-dom'
import { useUser } from '@/api/hooks/useUsers'
import { useAuth } from '@/contexts/AuthContext'
import { httpStatus } from '@/api/client'

export const usePersonProfile = () => {
  const { id = '' } = useParams()
  const { me, can } = useAuth()
  const query = useUser(id)

  const profile = query.data
  const isSelf = Boolean(me && me.id === id)

  const mentor =
    profile?.mentor ??
    (() => {
      const pair = profile?.mentorship?.pairs.find(p => p.menteeId === id)
      return pair ? { id: pair.mentorId, name: pair.mentorId } : null
    })()

  return {
    id,
    profile,
    isSelf,
    mentor,
    can,
    isLoading: query.isLoading,
    isNotFound: query.isError && httpStatus(query.error) === 404,
    isError: query.isError && httpStatus(query.error) !== 404,
    refetch: query.refetch,
  }
}
