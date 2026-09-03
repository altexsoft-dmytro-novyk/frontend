/**
 * Organisational-relationship request functions (`services/backend` Epic 4 —
 * the dedicated organisational-relationship screen).
 *
 * Only the fully-operable slice is covered: first manager assignment, the
 * People-Partner assign/replace/remove edge, and the append-only access-journal
 * read. Everything else on the Epic 4 surface needs a companion read endpoint
 * that does not exist yet (see `deferred-work.md`).
 */

import { apiClient } from '@/api/client'
import type {
  AccessJournalResponse,
  AssignManagerPayload,
  ChangePeoplePartnerPayload,
  RelationshipEdge,
} from '@/types/api'

const userPath = (id: string): string => `/users/${encodeURIComponent(id)}`

/** `GET /users/:id/access-journal` — newest-first; `403` for anyone who is not
 * the subject's current manager or assigned People Partner. */
export const getAccessJournalApiCall = (id: string): Promise<AccessJournalResponse> =>
  apiClient.get<AccessJournalResponse>(`${userPath(id)}/access-journal`)

/** `POST /users/:id/relationships` — first manager assignment. The body is
 * exactly `{ type: 'direct', targetId }`. */
export const assignManagerApiCall = (id: string, targetId: string): Promise<RelationshipEdge> => {
  const payload: AssignManagerPayload = { type: 'direct', targetId }
  return apiClient.post<RelationshipEdge>(`${userPath(id)}/relationships`, payload)
}

/** `PUT /users/:id/relationships/people-partner` — unconditional
 * assign-or-replace (the `expectedCurrentTargetId` token is not wired). */
export const changePeoplePartnerApiCall = (
  id: string,
  targetId: string
): Promise<RelationshipEdge> => {
  const payload: ChangePeoplePartnerPayload = { targetId }
  return apiClient.put<RelationshipEdge>(`${userPath(id)}/relationships/people-partner`, payload)
}

/** `DELETE /users/:id/relationships/people-partner` — unconditional removal.
 * `404` when there is no current People Partner. */
export const removePeoplePartnerApiCall = (id: string): Promise<void> =>
  apiClient.delete<void>(`${userPath(id)}/relationships/people-partner`)
