import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import {
  addDocumentApiCall,
  addEventApiCall,
  addFeedbackApiCall,
  addNoteApiCall,
  addRiskApiCall,
  completeIdpApiCall,
  createActionItemApiCall,
  createMentorshipPairApiCall,
  deleteEventApiCall,
  patchCustomFieldsApiCall,
  patchEmergencyContactsApiCall,
  patchEmploymentApiCall,
  patchPersonalContactsApiCall,
  updateActionItemApiCall,
} from '@/api/sections'
import type {
  AddEventBody,
  DocumentRecord,
  EmergencyContacts,
  FeedbackRecord,
  NoteRecord,
  PersonalContacts,
  RiskRecord,
} from '@/types/domain'

function useSectionInvalidator(id: string, section: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.section(id, section) })
}

export const usePatchEmployment = (id: string) => {
  const invalidate = useSectionInvalidator(id, 'employment')
  return useMutation({
    mutationFn: (body: { grade: string }) => patchEmploymentApiCall(id, body),
    onSuccess: invalidate,
  })
}

export const usePatchPersonalContacts = (id: string) => {
  const invalidate = useSectionInvalidator(id, 'personal-contacts')
  return useMutation({
    mutationFn: (body: Partial<PersonalContacts>) => patchPersonalContactsApiCall(id, body),
    onSuccess: invalidate,
  })
}

export const usePatchEmergencyContacts = (id: string) => {
  const invalidate = useSectionInvalidator(id, 'emergency-contacts')
  return useMutation({
    mutationFn: (body: Partial<EmergencyContacts>) => patchEmergencyContactsApiCall(id, body),
    onSuccess: invalidate,
  })
}

export const useAddDocument = (id: string) => {
  const invalidate = useSectionInvalidator(id, 'documents')
  return useMutation({
    mutationFn: (body: Pick<DocumentRecord, 'type' | 'title'>) => addDocumentApiCall(id, body),
    onSuccess: invalidate,
  })
}

export const useAddRisk = (id: string) => {
  const invalidate = useSectionInvalidator(id, 'risks')
  return useMutation({
    mutationFn: (body: Pick<RiskRecord, 'level' | 'description'>) => addRiskApiCall(id, body),
    onSuccess: invalidate,
  })
}

export const useAddNote = (id: string) => {
  const invalidate = useSectionInvalidator(id, 'notes')
  return useMutation({
    mutationFn: (body: Pick<NoteRecord, 'body' | 'visibleForEmployee'>) => addNoteApiCall(id, body),
    onSuccess: invalidate,
  })
}

export const useAddFeedback = (id: string) => {
  const invalidate = useSectionInvalidator(id, 'feedbacks')
  return useMutation({
    mutationFn: (body: Pick<FeedbackRecord, 'body' | 'sharedWithEmployee'>) =>
      addFeedbackApiCall(id, body),
    onSuccess: invalidate,
  })
}

export const useAddEvent = (id: string) => {
  const invalidate = useSectionInvalidator(id, 'events')
  return useMutation({
    mutationFn: (body: AddEventBody) => addEventApiCall(id, body),
    onSuccess: invalidate,
  })
}

export const useDeleteEvent = (id: string) => {
  const invalidate = useSectionInvalidator(id, 'events')
  return useMutation({
    mutationFn: (eventId: string) => deleteEventApiCall(id, eventId),
    onSuccess: invalidate,
  })
}

export const useCompleteIdp = (id: string) => {
  const invalidate = useSectionInvalidator(id, 'assessments')
  return useMutation({
    mutationFn: (idpId: string) => completeIdpApiCall(id, idpId),
    onSuccess: invalidate,
  })
}

export const usePatchCustomFields = (id: string) => {
  const invalidate = useSectionInvalidator(id, 'custom-fields')
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => patchCustomFieldsApiCall(id, body),
    onSuccess: invalidate,
  })
}

export const useCreateActionItem = (assigneeId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => createActionItemApiCall({ assigneeId, title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.actionItems(assigneeId) }),
  })
}

export const useUpdateActionItem = (assigneeId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: string }) =>
      updateActionItemApiCall(itemId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.actionItems(assigneeId) }),
  })
}

export const useCreateMentorshipPair = (userId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { mentorId: string; menteeId: string }) => createMentorshipPairApiCall(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mentorshipPairs(userId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) })
    },
  })
}
