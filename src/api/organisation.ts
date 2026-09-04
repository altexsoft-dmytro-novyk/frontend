/**
 * Organisational-relationship request functions (`services/backend` Epic 4 +
 * Story 6.1 — the dedicated organisational-relationship screen).
 *
 * Covered: the authoritative current-relationships read, first manager
 * assignment, manager reassignment (explicit delete-then-assign) and hard
 * delete, the People-Partner assign/replace/remove edge, and the append-only
 * access-journal read. Department membership / department manager stay deferred
 * (`deferred-work.md`).
 */

import { apiClient } from '@/api/client'
import type {
  AccessJournalResponse,
  AssignManagerPayload,
  ChangePeoplePartnerPayload,
  RelationshipEdge,
  RelationshipsResponse,
} from '@/types/api'

const userPath = (id: string): string => `/users/${encodeURIComponent(id)}`

/** `GET /users/:id/access-journal` — newest-first; `403` for anyone who is not
 * the subject's current manager or assigned People Partner. */
export const getAccessJournalApiCall = (id: string): Promise<AccessJournalResponse> =>
  apiClient.get<AccessJournalResponse>(`${userPath(id)}/access-journal`)

/** `GET /users/:id/relationships` (Story 6.1) — the authoritative current
 * manager (`direct`) and People Partner (`people_partner`) edges. `403` for
 * anyone who is not the subject's current manager / assigned People Partner nor
 * an `org:relationships:write` holder (same posture as the access journal);
 * `404` when `:id` is not an active user. */
export const getRelationshipsApiCall = (id: string): Promise<RelationshipsResponse> =>
  apiClient.get<RelationshipsResponse>(`${userPath(id)}/relationships`)

/** `POST /users/:id/relationships` — first manager assignment. The body is
 * exactly `{ type: 'direct', targetId }`. `409` when a `direct` edge already
 * exists (reassignment is delete-then-assign, see `useReassignManager`). */
export const assignManagerApiCall = (id: string, targetId: string): Promise<RelationshipEdge> => {
  const payload: AssignManagerPayload = { type: 'direct', targetId }
  return apiClient.post<RelationshipEdge>(`${userPath(id)}/relationships`, payload)
}

/** `DELETE /users/:id/relationships/:relationshipId` — hard delete of a single
 * edge (manager remove, and the first leg of a reassignment). */
export const deleteRelationshipApiCall = (id: string, relationshipId: string): Promise<void> =>
  apiClient.delete<void>(`${userPath(id)}/relationships/${encodeURIComponent(relationshipId)}`)

/** `PUT /users/:id/relationships/people-partner` — assign-or-replace. When
 * `expectedCurrentTargetId` is supplied it is sent as an optimistic-concurrency
 * token; the backend answers `409` if the current People Partner no longer
 * matches it. */
export const changePeoplePartnerApiCall = (
  id: string,
  targetId: string,
  expectedCurrentTargetId?: string
): Promise<RelationshipEdge> => {
  const payload: ChangePeoplePartnerPayload = { targetId }
  if (expectedCurrentTargetId !== undefined) {
    payload.expectedCurrentTargetId = expectedCurrentTargetId
  }
  return apiClient.put<RelationshipEdge>(`${userPath(id)}/relationships/people-partner`, payload)
}

/** `DELETE /users/:id/relationships/people-partner` — removal. `404` when there
 * is no current People Partner. When `expectedCurrentTargetId` is supplied it
 * is sent as the `?expectedCurrentTargetId=` optimistic-concurrency token and
 * the backend answers `409` on a mismatch. */
export const removePeoplePartnerApiCall = (
  id: string,
  expectedCurrentTargetId?: string
): Promise<void> =>
  apiClient.delete<void>(`${userPath(id)}/relationships/people-partner`, {
    params: expectedCurrentTargetId === undefined ? undefined : { expectedCurrentTargetId },
  })
