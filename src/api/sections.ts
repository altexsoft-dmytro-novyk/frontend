import { apiClient } from '@/api/client'
import type {
  ActionItem,
  ActionItemsResponse,
  AddEventBody,
  AssessmentsResponse,
  CustomFieldsResponse,
  DocumentRecord,
  DocumentsResponse,
  EmergencyContacts,
  EmergencyContactsResponse,
  Employment,
  EmploymentResponse,
  EventsResponse,
  FeedbackRecord,
  FeedbacksResponse,
  LeavesResponse,
  MentorshipPair,
  MentorshipPairsResponse,
  NoteRecord,
  NotesResponse,
  PersonalContacts,
  PersonalContactsResponse,
  RequestHistoryResponse,
  RiskRecord,
  RisksResponse,
} from '@/types/domain'

// --- S4 employment ---
export const getEmploymentApiCall = (id: string) =>
  apiClient.get<EmploymentResponse>(`/users/${id}/employment`)
export const patchEmploymentApiCall = (id: string, body: Partial<Pick<Employment, 'grade'>>) =>
  apiClient.patch<EmploymentResponse>(`/users/${id}/employment`, body)

// --- S2 personal contacts ---
export const getPersonalContactsApiCall = (id: string) =>
  apiClient.get<PersonalContactsResponse>(`/users/${id}/personal-contacts`)
export const patchPersonalContactsApiCall = (id: string, body: Partial<PersonalContacts>) =>
  apiClient.patch<PersonalContactsResponse>(`/users/${id}/personal-contacts`, body)

// --- S3 emergency contacts ---
export const getEmergencyContactsApiCall = (id: string) =>
  apiClient.get<EmergencyContactsResponse>(`/users/${id}/emergency-contacts`)
export const patchEmergencyContactsApiCall = (id: string, body: Partial<EmergencyContacts>) =>
  apiClient.patch<EmergencyContactsResponse>(`/users/${id}/emergency-contacts`, body)

// --- S5 documents ---
export const getDocumentsApiCall = (id: string) =>
  apiClient.get<DocumentsResponse>(`/users/${id}/documents`)
export const addDocumentApiCall = (id: string, body: Pick<DocumentRecord, 'type' | 'title'>) =>
  apiClient.post<DocumentRecord>(`/users/${id}/documents`, body)

// --- S6 risks ---
export const getRisksApiCall = (id: string) => apiClient.get<RisksResponse>(`/users/${id}/risks`)
export const addRiskApiCall = (id: string, body: Pick<RiskRecord, 'level' | 'description'>) =>
  apiClient.post<RiskRecord>(`/users/${id}/risks`, body)

// --- S7 management notes ---
export const getNotesApiCall = (id: string) => apiClient.get<NotesResponse>(`/users/${id}/notes`)
export const addNoteApiCall = (id: string, body: Pick<NoteRecord, 'body' | 'visibleForEmployee'>) =>
  apiClient.post<NoteRecord>(`/users/${id}/notes`, body)

// --- S8 feedbacks ---
export const getFeedbacksApiCall = (id: string) =>
  apiClient.get<FeedbacksResponse>(`/users/${id}/feedbacks`)
export const addFeedbackApiCall = (
  id: string,
  body: Pick<FeedbackRecord, 'body' | 'sharedWithEmployee'>
) => apiClient.post<FeedbackRecord>(`/users/${id}/feedbacks`, body)

// --- S9 career timeline ---
export const getEventsApiCall = (id: string) => apiClient.get<EventsResponse>(`/users/${id}/events`)
export const addEventApiCall = (id: string, body: AddEventBody) =>
  apiClient.post<{ id: string }>(`/users/${id}/events`, body)
export const deleteEventApiCall = (id: string, eventId: string) =>
  apiClient.delete<{ id: string }>(`/users/${id}/events/${eventId}`)

// --- S10 leaves (read-only) ---
export const getLeavesApiCall = (id: string) => apiClient.get<LeavesResponse>(`/users/${id}/leaves`)

// --- S12 CDS / assessments ---
export const getAssessmentsApiCall = (id: string) =>
  apiClient.get<AssessmentsResponse>(`/users/${id}/assessments`)
export const postAssessmentApiCall = (id: string, body: { cycle: string }) =>
  apiClient.post<{ cycle: string }>(`/users/${id}/assessments`, body)
export const completeIdpApiCall = (id: string, idpId: string) =>
  apiClient.patch<{ complete: boolean; completedAt: string }>(`/users/${id}/assessments/${idpId}`, {
    complete: true,
  })

// --- S15 request history (read-only) ---
export const getRequestHistoryApiCall = (id: string) =>
  apiClient.get<RequestHistoryResponse>(`/users/${id}/request-history`)

// --- S16 custom fields ---
export const getCustomFieldsApiCall = (id: string) =>
  apiClient.get<CustomFieldsResponse>(`/users/${id}/custom-fields`)
export const patchCustomFieldsApiCall = (id: string, body: Record<string, unknown>) =>
  apiClient.patch<CustomFieldsResponse>(`/users/${id}/custom-fields`, body)

// --- S14 action items (global resource, filtered by assignee) ---
export const getActionItemsApiCall = (assigneeId: string) =>
  apiClient.get<ActionItemsResponse>('/action-items', { params: { assigneeId } })
export const createActionItemApiCall = (body: { assigneeId: string; title: string }) =>
  apiClient.post<ActionItem>('/action-items', body)
export const updateActionItemApiCall = (itemId: string, body: { status: string }) =>
  apiClient.patch<ActionItem>(`/action-items/${itemId}`, body)

// --- S13 mentorship pairs (global resource) ---
export const getMentorshipPairsApiCall = (userId: string) =>
  apiClient.get<MentorshipPairsResponse>('/mentorship-pairs', { params: { userId } })
export const createMentorshipPairApiCall = (body: { mentorId: string; menteeId: string }) =>
  apiClient.post<MentorshipPair>('/mentorship-pairs', body)
