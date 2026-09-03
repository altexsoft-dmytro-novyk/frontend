/**
 * Shared helpers for reading an axios failure. Technical (transport-shape) only —
 * no domain logic. Used by the query-retry gates and the mutation error mappers.
 */

import { isAxiosError } from 'axios'

/** The HTTP status of a failed request, or `undefined` for a transport error
 * (no response) or a non-axios error. */
export const httpStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined

/**
 * The `error` string in a `{ error: '...' }` response body — the backend uses it
 * to disambiguate same-status outcomes (e.g. `409 target_has_scheduled_departure`
 * vs. a plain `409`).
 */
export const errorCode = (error: unknown): string | undefined => {
  if (!isAxiosError(error)) {
    return undefined
  }
  const data = error.response?.data
  if (typeof data === 'object' && data !== null && 'error' in data) {
    const code = (data as { error: unknown }).error
    return typeof code === 'string' ? code : undefined
  }
  return undefined
}
