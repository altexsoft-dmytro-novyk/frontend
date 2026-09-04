/**
 * Magic-link auth request functions. Both endpoints are unauthenticated by
 * design — the caller has no session yet.
 */

import { apiClient } from '@/api/client'
import type {
  ConsumeMagicLinkPayload,
  EstablishedSession,
  RequestMagicLinkPayload,
  RequestMagicLinkResponse,
} from '@/types/api'

export const requestMagicLinkApiCall = (
  payload: RequestMagicLinkPayload
): Promise<RequestMagicLinkResponse> =>
  apiClient.post<RequestMagicLinkResponse>('/auth/magic-link', payload)

export const consumeMagicLinkApiCall = (
  payload: ConsumeMagicLinkPayload
): Promise<EstablishedSession> =>
  apiClient.post<EstablishedSession>('/auth/magic-link/consume', payload)
