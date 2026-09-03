/**
 * Departure-workflow request functions (`services/backend` Epic 5, AD-20 — the
 * departure command + status surface). All routes carry the
 * `employee:departure:record` capability, so most actors get `403` on a write;
 * the screen renders the form and collapses to a permission notice on the first
 * `403` (same attempt-and-handle pattern as the organisation screen).
 */

import { apiClient } from '@/api/client'
import type {
  DepartureView,
  RecordDeparturePayload,
  ReparentDeparturePayload,
  ReparentingResult,
} from '@/types/api'

const userPath = (id: string): string => `/users/${encodeURIComponent(id)}`

/**
 * `POST /users/:id/departures` — records a scheduled departure. The
 * `Idempotency-Key` header makes an accidental double-submit of the same values
 * idempotent (the backend returns the original result); a corrected resubmit
 * must carry a NEW key or the backend answers `409 idempotency_key_payload_mismatch`.
 * Outcomes: `201` → `DepartureView`; `409` bodies `{ error }` for
 * `departure_blocked_by_responsibilities` (+ `blockers`, `expectedBlockerVersion`,
 * `defaultReparentTargetId?`), `departure_already_scheduled`,
 * `idempotency_key_payload_mismatch`; `400` field errors; `403` permission.
 */
export const recordDepartureApiCall = (
  id: string,
  payload: RecordDeparturePayload,
  idempotencyKey: string
): Promise<DepartureView> =>
  apiClient.post<DepartureView>(`${userPath(id)}/departures`, payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })

/** `GET /users/:id/departures/:departureId` — authorized status + sanitized
 * diagnostics. `404` when the id is unknown or belongs to another user. */
export const getDepartureApiCall = (id: string, departureId: string): Promise<DepartureView> =>
  apiClient.get<DepartureView>(`${userPath(id)}/departures/${encodeURIComponent(departureId)}`)

/** `POST /users/:id/departures/:departureId/retry` — accelerate a `retry_wait`
 * departure. `202` (no body); `409 { error: 'departure_not_retryable' }` from
 * any other state; `404` for an unknown id. */
export const retryDepartureApiCall = (id: string, departureId: string): Promise<void> =>
  apiClient.post<void>(`${userPath(id)}/departures/${encodeURIComponent(departureId)}/retry`)

/**
 * `POST /users/:id/departure-reparenting` — the one-click remediation for
 * platform-owned blockers. `expectedBlockerVersion` is echoed verbatim from the
 * blocker response. `200` → `ReparentingResult`; `400` target === subject;
 * `404` unknown target; `422` inactive target; `409 { error: 'blocker_version_stale' }`.
 */
export const reparentDepartureApiCall = (
  id: string,
  payload: ReparentDeparturePayload
): Promise<ReparentingResult> =>
  apiClient.post<ReparentingResult>(`${userPath(id)}/departure-reparenting`, payload)
