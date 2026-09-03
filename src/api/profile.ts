/**
 * Employee-profile request functions (`services/backend` Stories 1.2 / 1.3 /
 * 3.1–3.3): the S1 identity card, self-service photo, and the career timeline.
 */

import { apiClient } from '@/api/client'
import type {
  CareerTimelineResponse,
  CreateCareerEventPayload,
  UpdateIdentityCardPayload,
  UserCardResponse,
} from '@/types/api'

const userPath = (id: string): string => `/users/${encodeURIComponent(id)}`

export const getEmployeeApiCall = (id: string): Promise<UserCardResponse> =>
  apiClient.get<UserCardResponse>(userPath(id))

/**
 * `PATCH /users/:id` — sends only the changed subset. The backend answers with
 * the whole-row user object, not the `{ data, canEdit }` card envelope; callers
 * refetch `GET /users/:id` rather than trusting this body's extra fields.
 */
export const updateEmployeeApiCall = (
  id: string,
  payload: UpdateIdentityCardPayload
): Promise<unknown> => apiClient.patch<unknown>(userPath(id), payload)

/**
 * `PUT /users/:id/photo` — multipart, field name `photo`. The instance default
 * `Content-Type: application/json` would make axios JSON-serialize the
 * `FormData`, so it is overridden to `multipart/form-data`; the browser adapter
 * then strips that and sets the real boundary itself.
 */
export const uploadEmployeePhotoApiCall = (id: string, file: File): Promise<unknown> => {
  const body = new FormData()
  body.append('photo', file)
  return apiClient.put<unknown>(`${userPath(id)}/photo`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getCareerEventsApiCall = (id: string): Promise<CareerTimelineResponse> =>
  apiClient.get<CareerTimelineResponse>(`${userPath(id)}/events`)

export const createCareerEventApiCall = (
  id: string,
  payload: CreateCareerEventPayload
): Promise<unknown> => apiClient.post<unknown>(`${userPath(id)}/events`, payload)

export const deleteCareerEventApiCall = (id: string, eventId: string): Promise<void> =>
  apiClient.delete<void>(`${userPath(id)}/events/${encodeURIComponent(eventId)}`)
