import { apiClient } from '@/api/client'
import type {
  DepartmentManagerChangeBody,
  DepartureBody,
  DepartureResponse,
  RelationshipChangeBody,
} from '@/types/domain'

export const changeRelationshipApiCall = (userId: string, body: RelationshipChangeBody) =>
  apiClient.post<{ field: string; value: string | null }>(`/users/${userId}/relationships`, body)

export const changeDepartmentManagerApiCall = (
  departmentId: string,
  body: DepartmentManagerChangeBody
) =>
  apiClient.post<{ departmentId: string; managerId: string | null }>(
    `/departments/${departmentId}/manager`,
    body
  )

export const recordDepartureApiCall = (userId: string, body: DepartureBody) =>
  apiClient.post<DepartureResponse>(`/users/${userId}/departure`, body)
