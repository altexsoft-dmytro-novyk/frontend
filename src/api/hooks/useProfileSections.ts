import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { httpStatus } from '@/api/client'
import {
  getActionItemsApiCall,
  getAssessmentsApiCall,
  getCustomFieldsApiCall,
  getDocumentsApiCall,
  getEmergencyContactsApiCall,
  getEmploymentApiCall,
  getEventsApiCall,
  getFeedbacksApiCall,
  getLeavesApiCall,
  getMentorshipPairsApiCall,
  getNotesApiCall,
  getPersonalContactsApiCall,
  getRequestHistoryApiCall,
  getRisksApiCall,
} from '@/api/sections'

/**
 * The backend answers a section the viewer cannot see with `404` (the section
 * is never acknowledged). Every section query therefore uses `retry: false` and
 * callers read `sectionAccess(query)` to decide between "hide the panel"
 * (`'none'`), "show it" (`'ok'`), or "still loading / errored".
 */
export type SectionAccess = 'loading' | 'ok' | 'none' | 'error'

export function sectionAccess(
  query: Pick<UseQueryResult, 'isLoading' | 'isError' | 'error' | 'isSuccess'>
): SectionAccess {
  if (query.isLoading) return 'loading'
  if (query.isSuccess) return 'ok'
  if (query.isError) return httpStatus(query.error) === 404 ? 'none' : 'error'
  return 'loading'
}

const sectionOptions = { retry: false, staleTime: 60 * 1000 } as const

export const useEmployment = (id: string) =>
  useQuery({
    queryKey: queryKeys.section(id, 'employment'),
    queryFn: () => getEmploymentApiCall(id),
    ...sectionOptions,
  })

export const usePersonalContacts = (id: string) =>
  useQuery({
    queryKey: queryKeys.section(id, 'personal-contacts'),
    queryFn: () => getPersonalContactsApiCall(id),
    ...sectionOptions,
  })

export const useEmergencyContacts = (id: string) =>
  useQuery({
    queryKey: queryKeys.section(id, 'emergency-contacts'),
    queryFn: () => getEmergencyContactsApiCall(id),
    ...sectionOptions,
  })

export const useDocuments = (id: string) =>
  useQuery({
    queryKey: queryKeys.section(id, 'documents'),
    queryFn: () => getDocumentsApiCall(id),
    ...sectionOptions,
  })

export const useRisks = (id: string) =>
  useQuery({
    queryKey: queryKeys.section(id, 'risks'),
    queryFn: () => getRisksApiCall(id),
    ...sectionOptions,
  })

export const useNotes = (id: string) =>
  useQuery({
    queryKey: queryKeys.section(id, 'notes'),
    queryFn: () => getNotesApiCall(id),
    ...sectionOptions,
  })

export const useFeedbacks = (id: string) =>
  useQuery({
    queryKey: queryKeys.section(id, 'feedbacks'),
    queryFn: () => getFeedbacksApiCall(id),
    ...sectionOptions,
  })

export const useEvents = (id: string) =>
  useQuery({
    queryKey: queryKeys.section(id, 'events'),
    queryFn: () => getEventsApiCall(id),
    ...sectionOptions,
  })

export const useLeaves = (id: string) =>
  useQuery({
    queryKey: queryKeys.section(id, 'leaves'),
    queryFn: () => getLeavesApiCall(id),
    ...sectionOptions,
  })

export const useAssessments = (id: string) =>
  useQuery({
    queryKey: queryKeys.section(id, 'assessments'),
    queryFn: () => getAssessmentsApiCall(id),
    ...sectionOptions,
  })

export const useRequestHistory = (id: string) =>
  useQuery({
    queryKey: queryKeys.section(id, 'request-history'),
    queryFn: () => getRequestHistoryApiCall(id),
    ...sectionOptions,
  })

export const useCustomFields = (id: string) =>
  useQuery({
    queryKey: queryKeys.section(id, 'custom-fields'),
    queryFn: () => getCustomFieldsApiCall(id),
    ...sectionOptions,
  })

export const useActionItems = (assigneeId: string) =>
  useQuery({
    queryKey: queryKeys.actionItems(assigneeId),
    queryFn: () => getActionItemsApiCall(assigneeId),
    ...sectionOptions,
  })

export const useMentorshipPairs = (userId: string) =>
  useQuery({
    queryKey: queryKeys.mentorshipPairs(userId),
    queryFn: () => getMentorshipPairsApiCall(userId),
    ...sectionOptions,
  })
