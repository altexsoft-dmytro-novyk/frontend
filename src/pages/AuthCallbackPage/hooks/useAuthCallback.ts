import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useConsumeMagicLink } from '@/api/hooks/useAuth'
import { useAuth } from '@/contexts/AuthContext'

export const useAuthCallback = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const token = params.get('token')
  const returnTo = params.get('returnTo')

  const consume = useConsumeMagicLink(token)

  useEffect(() => {
    if (!consume.isSuccess) return
    signIn(consume.data.accessToken)
    navigate(returnTo ? decodeURIComponent(returnTo) : '/', { replace: true })
  }, [consume.isSuccess, consume.data, returnTo, signIn, navigate])

  return { failed: !token || consume.isError }
}
