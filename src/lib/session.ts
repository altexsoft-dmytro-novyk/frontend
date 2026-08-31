/**
 * Session token store — a tiny observable box around localStorage.
 *
 * Lives outside React so the Axios interceptor (a non-React module) can read the
 * current token synchronously, while `AuthContext` subscribes for re-renders.
 */

const STORAGE_KEY = 'pm.auth.token'

type Listener = (token: string | null) => void

const listeners = new Set<Listener>()

function readInitial(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

let current: string | null = readInitial()

export const session = {
  get(): string | null {
    return current
  },

  set(token: string | null): void {
    current = token
    try {
      if (token) localStorage.setItem(STORAGE_KEY, token)
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Private-mode / storage-disabled: keep the in-memory value, still usable this session.
    }
    listeners.forEach(fn => fn(token))
  },

  clear(): void {
    session.set(null)
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}

/**
 * Decodes the `userId` claim from the (unverified) session JWT payload. Used only
 * as a fallback identity hint before `GET /me` lands — never for trust decisions.
 */
export function decodeUserId(token: string | null): string | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as {
      userId?: string
    }
    return typeof payload.userId === 'string' ? payload.userId : null
  } catch {
    return null
  }
}
