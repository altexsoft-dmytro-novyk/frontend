import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMe } from '@/api/hooks/useAuth'
import { queryKeys } from '@/api/queryKeys'
import { session } from '@/lib/session'
import type { FeaturePermission, Me } from '@/types/domain'

/* eslint-disable react-refresh/only-export-components */

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  status: AuthStatus
  me: Me | undefined
  /** Store a freshly issued session token and load the profile. */
  signIn: (accessToken: string) => void
  signOut: () => void
  /** True when the signed-in user holds the given feature permission. */
  can: (permission: FeaturePermission) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(() => session.get())

  useEffect(() => session.subscribe(setToken), [])

  const meQuery = useMe()

  const signIn = useCallback(
    (accessToken: string) => {
      session.set(accessToken)
      void queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
    [queryClient]
  )

  const signOut = useCallback(() => {
    session.clear()
    queryClient.clear()
  }, [queryClient])

  let status: AuthStatus = 'anonymous'
  if (token) {
    status = meQuery.isLoading ? 'loading' : meQuery.data ? 'authenticated' : 'anonymous'
  }

  const me = meQuery.data
  const can = useCallback(
    (permission: FeaturePermission) => Boolean(me?.permissions.includes(permission)),
    [me]
  )

  return (
    <AuthContext.Provider value={{ status, me, signIn, signOut, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
