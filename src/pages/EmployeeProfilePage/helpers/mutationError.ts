import { isAxiosError } from 'axios'

export type MutationErrorKind = 'permission' | 'network' | 'generic'

/**
 * Classify a failed mutation for user-facing copy:
 *  - `403` / `404` → the viewer's access changed (or the target is gone)
 *  - no response (transport) or `>= 500` → a transient server/network problem
 *  - anything else (`400`, `422`, …) → a generic "check the fields" message
 *
 * `409` is intentionally not handled here — callers map it to a specific field.
 */
export const classifyMutationError = (error: unknown): MutationErrorKind => {
  if (!isAxiosError(error)) {
    return 'network'
  }
  const status = error.response?.status
  if (status === 403 || status === 404) {
    return 'permission'
  }
  if (status === undefined || status >= 500) {
    return 'network'
  }
  return 'generic'
}
