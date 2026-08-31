import { useMutation, useQuery } from '@tanstack/react-query'
import { consumeMagicLinkApiCall, getMeApiCall, requestMagicLinkApiCall } from '@/api/auth'
import { queryKeys } from '@/api/queryKeys'
import { session } from '@/lib/session'

export const useRequestMagicLink = () =>
  useMutation({
    mutationFn: (email: string) => requestMagicLinkApiCall(email),
  })

/**
 * Consumes the magic-link token exactly once. Modelled as a query, not a
 * mutation, so React Query dedupes and caches the single in-flight request:
 * under `<StrictMode>` the mount→unmount→remount cycle would otherwise fire two
 * consume calls (the second hitting a spent, single-use token) or strand the
 * result on an unmounted observer whose `mutate` callbacks never run.
 */
export const useConsumeMagicLink = (token: string | null) =>
  useQuery({
    queryKey: queryKeys.magicLinkConsume(token ?? ''),
    queryFn: () => consumeMagicLinkApiCall(token as string),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

/** The signed-in user; enabled only when a token is present. */
export const useMe = () =>
  useQuery({
    queryKey: queryKeys.me,
    queryFn: getMeApiCall,
    enabled: Boolean(session.get()),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
