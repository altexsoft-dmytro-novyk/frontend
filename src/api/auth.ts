import { apiClient } from '@/api/client'
import { decodeUserId, session } from '@/lib/session'
import type {
  MagicLinkConsumeResponse,
  MagicLinkRequestResponse,
  Me,
  UserProfile,
} from '@/types/domain'

export async function requestMagicLinkApiCall(email: string): Promise<MagicLinkRequestResponse> {
  return apiClient.post<MagicLinkRequestResponse>('/auth/magic-link', { email })
}

export async function consumeMagicLinkApiCall(token: string): Promise<MagicLinkConsumeResponse> {
  return apiClient.post<MagicLinkConsumeResponse>('/auth/magic-link/consume', { token })
}

/**
 * Resolves the signed-in user. Prefers `GET /me` (backend delta B2); if that
 * endpoint is not deployed yet (404), falls back to decoding the JWT `userId`,
 * reading that profile, and probing `GET /roles` for the one permission that is
 * probeable.
 */
export async function getMeApiCall(): Promise<Me> {
  try {
    return await apiClient.get<Me>('/me')
  } catch (error) {
    if (!is404(error)) throw error
    return getMeFallback()
  }
}

function is404(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  )
}

async function getMeFallback(): Promise<Me> {
  const id = decodeUserId(session.get())
  if (!id) throw new Error('No user id in session token')

  const profile = await apiClient.get<UserProfile>(`/users/${id}`)
  let canManageRoles = false
  try {
    await apiClient.get('/roles')
    canManageRoles = true
  } catch {
    // 403 → the caller is not a roles admin; leave the flag false.
  }

  return {
    id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    workEmail: profile.workEmail,
    photo: profile.photo,
    employmentStatus: profile.employmentStatus,
    permissions: canManageRoles ? ['manage_roles'] : [],
  }
}
