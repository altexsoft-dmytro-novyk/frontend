import { useMutation } from '@tanstack/react-query'
import { consumeMagicLinkApiCall } from '@/api/auth'
import type { ConsumeMagicLinkPayload, EstablishedSession } from '@/types/api'

/**
 * POST /auth/magic-link/consume. Every failure (missing/expired/consumed token,
 * inactive owner) is a single generic 401 — the caller renders one generic error.
 */
export const useConsumeMagicLink = () => {
  return useMutation<EstablishedSession, unknown, ConsumeMagicLinkPayload>({
    mutationKey: ['auth', 'consume-magic-link'],
    mutationFn: consumeMagicLinkApiCall,
  })
}
