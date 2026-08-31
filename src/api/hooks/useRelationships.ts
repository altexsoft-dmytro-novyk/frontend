import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import {
  changeDepartmentManagerApiCall,
  changeRelationshipApiCall,
  recordDepartureApiCall,
} from '@/api/relationships'
import type {
  DepartmentManagerChangeBody,
  DepartureBody,
  RelationshipChangeBody,
} from '@/types/domain'

export const useChangeRelationship = (userId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: RelationshipChangeBody) => changeRelationshipApiCall(userId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) }),
  })
}

export const useChangeDepartmentManager = (userId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      departmentId,
      ...body
    }: DepartmentManagerChangeBody & { departmentId: string }) =>
      changeDepartmentManagerApiCall(departmentId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) }),
  })
}

export const useRecordDeparture = (userId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: DepartureBody) => recordDepartureApiCall(userId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) })
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
