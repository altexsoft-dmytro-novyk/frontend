import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useConsumeMagicLink } from '@/api/hooks/useConsumeMagicLink'

type Status = 'verifying' | 'error'

export const useConsumeMagicLinkPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { login, isAuthenticated } = useAuth()
  const consumeMagicLink = useConsumeMagicLink()

  // Snapshots taken before the first effect run (which strips the query and may
  // authenticate).
  const [tokenMissing] = useState(() => !searchParams.get('token'))
  const [authenticatedOnMount] = useState(isAuthenticated)
  const [consumeFailed, setConsumeFailed] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current || authenticatedOnMount) {
      return
    }
    hasRun.current = true

    const token = searchParams.get('token')
    // Strip the single-use token from the URL/history immediately — it must not
    // linger in the address bar or back-stack on any outcome. Done after the
    // `hasRun` guard is set so this replace can't re-trigger or cancel consume.
    if (searchParams.has('token')) {
      setSearchParams({}, { replace: true })
    }
    if (!token) {
      return
    }

    consumeMagicLink
      .mutateAsync({ token })
      .then(session => {
        // DEC-UM-004: a success body with no token, or a token the auth context
        // rejects (unparseable / expired), is the same one generic failure.
        if (!session?.sessionToken || !login(session)) {
          setConsumeFailed(true)
        }
      })
      .catch(() => {
        setConsumeFailed(true)
      })
  }, [authenticatedOnMount, searchParams, setSearchParams, consumeMagicLink, login])

  const status: Status = tokenMissing || consumeFailed ? 'error' : 'verifying'

  return {
    status,
    // Redirect once a session exists — set on mount, or after a successful consume.
    redirectHome: authenticatedOnMount || isAuthenticated,
  }
}
