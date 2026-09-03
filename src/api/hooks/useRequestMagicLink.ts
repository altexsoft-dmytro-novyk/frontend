import { useMutation } from '@tanstack/react-query'
import { requestMagicLinkApiCall } from '@/api/auth'
import type { RequestMagicLinkPayload, RequestMagicLinkResponse } from '@/types/api'

/**
 * POST /auth/magic-link. Success is enumeration-safe — the UI shows the same
 * confirmation regardless of whether the address matched an account.
 */
export const useRequestMagicLink = () => {
  return useMutation<RequestMagicLinkResponse, unknown, RequestMagicLinkPayload>({
    mutationKey: ['auth', 'request-magic-link'],
    mutationFn: requestMagicLinkApiCall,
  })
}
