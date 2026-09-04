import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { clearSession, decodeJwtSub, isJwtExpired, readSession, writeSession } from '@/lib/session'
import type { EstablishedSession } from '@/types/api'

/* eslint-disable react-refresh/only-export-components */

interface AuthContextValue {
  token: string | null
  userId: string | null
  isAuthenticated: boolean
  /** Returns `true` when the session token was valid and state is now authenticated. */
  login: (session: EstablishedSession) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthState {
  token: string | null
  userId: string | null
}

/**
 * Rehydrate auth state from `sessionStorage`. An expired or unparseable token is
 * treated as logged out; storage is NOT cleared here (that happens lazily in
 * `logout()` and the axios 401 interceptor) so this stays render-safe.
 */
const rehydrate = (): AuthState => {
  const token = readSession()
  if (!token || isJwtExpired(token)) {
    return { token: null, userId: null }
  }
  return { token, userId: decodeJwtSub(token) }
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>(rehydrate)

  const login = useCallback((session: EstablishedSession): boolean => {
    const token = session.sessionToken
    const userId = token ? decodeJwtSub(token) : null
    // Same guard as rehydrate(): only authenticate for a parseable, unexpired
    // token. Anything else leaves us logged out so the consume page falls
    // through to its generic-error branch.
    if (!token || userId === null || isJwtExpired(token)) {
      clearSession()
      setState({ token: null, userId: null })
      return false
    }
    writeSession(token)
    setState({ token, userId })
    return true
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setState({ token: null, userId: null })
    // AuthProvider sits outside the router (it wraps <RouterProvider>), so a
    // hard navigation is the correct way back to /login — same as the 401 path.
    if (typeof window !== 'undefined') {
      window.location.assign('/login')
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token: state.token,
      userId: state.userId,
      isAuthenticated: state.token !== null,
      login,
      logout,
    }),
    [state, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
