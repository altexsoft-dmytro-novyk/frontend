/**
 * Seeded-population import request function (`services/backend` Story 1.1 —
 * `POST /users/import`, AD-16).
 */

import { apiClient } from '@/api/client'
import type { ImportSummary } from '@/types/api'

/**
 * `POST /users/import` — `multipart/form-data`, one file part named `file` (the
 * semicolon-delimited timetracker CSV). The instance default
 * `Content-Type: application/json` would make axios JSON-serialize the
 * `FormData`, so it is overridden to `multipart/form-data`; the browser adapter
 * then strips that and sets the real `multipart/form-data; boundary=…` itself.
 * Same technique as `uploadEmployeePhotoApiCall`.
 *
 * A structurally valid file → `200` + `ImportSummary` (partial success allowed).
 * A file-level failure → `400` with a `message`; nothing was written.
 */
export const importPopulationApiCall = (file: File): Promise<ImportSummary> => {
  const body = new FormData()
  body.append('file', file)
  return apiClient.post<ImportSummary>('/users/import', body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
