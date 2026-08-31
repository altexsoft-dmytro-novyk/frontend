import { apiClient } from '@/api/client'
import type {
  PatchIdentityBody,
  PhotoUploadResponse,
  UserListQuery,
  UserListResponse,
  UserProfile,
} from '@/types/domain'

function toParams(query: UserListQuery): Record<string, string> {
  const params: Record<string, string> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    params[key] = String(value)
  }
  return params
}

export async function getUsersApiCall(query: UserListQuery = {}): Promise<UserListResponse> {
  return apiClient.get<UserListResponse>('/users', { params: toParams(query) })
}

export async function getUserApiCall(id: string): Promise<UserProfile> {
  return apiClient.get<UserProfile>(`/users/${id}`)
}

export async function patchUserApiCall(
  id: string,
  body: PatchIdentityBody
): Promise<Record<string, unknown>> {
  return apiClient.patch<Record<string, unknown>>(`/users/${id}`, body)
}

export async function uploadPhotoApiCall(id: string, file: File): Promise<PhotoUploadResponse> {
  const form = new FormData()
  form.append('photo', file)
  return apiClient.put<PhotoUploadResponse>(`/users/${id}/photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
