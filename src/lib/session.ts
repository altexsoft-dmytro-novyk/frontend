/**
 * Session-token storage + JWT introspection.
 *
 * The magic-link session token lives in `sessionStorage` (not `localStorage`) —
 * it must not survive the browser being closed. There is no `/me` endpoint, so
 * the current-user id is read from the JWT `sub` claim; the signature is NOT
 * verified client-side (the backend is the only authority on that).
 */

const SESSION_STORAGE_KEY = 'pp.session'

export const readSession = (): string | null => {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY)
  } catch {
    return null
  }
}

export const writeSession = (token: string): void => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, token)
  } catch {
    // Storage unavailable (private mode / disabled) — nothing we can do.
  }
}

export const clearSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // no-op
  }
}

interface JwtPayload {
  sub?: unknown
  exp?: unknown
}

const decodePayload = (token: string): JwtPayload | null => {
  const segment = token.split('.')[1]
  if (!segment) {
    return null
  }
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = atob(padded)
    const parsed: unknown = JSON.parse(json)
    if (typeof parsed !== 'object' || parsed === null) {
      return null
    }
    return parsed as JwtPayload
  } catch {
    return null
  }
}

/** The JWT `sub` claim (current-user id), or `null` if the token is unparseable. */
export const decodeJwtSub = (token: string): string | null => {
  const payload = decodePayload(token)
  return typeof payload?.sub === 'string' ? payload.sub : null
}

/**
 * `true` when the token is missing an `exp`, is unparseable, or `exp` is in the
 * past. A garbage token is treated as expired.
 */
export const isJwtExpired = (token: string): boolean => {
  const payload = decodePayload(token)
  if (typeof payload?.exp !== 'number') {
    return true
  }
  const nowSeconds = Math.floor(Date.now() / 1000)
  return nowSeconds >= payload.exp
}
