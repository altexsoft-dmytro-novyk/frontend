/**
 * Hand-written types for the People Management backend HTTP contract
 * (`/api/v1/...`). The backend controllers return untyped object literals, so
 * there is no generated client — these mirror the observed response shapes.
 */

// ---------------------------------------------------------------------------
// Auth & session
// ---------------------------------------------------------------------------

export interface MagicLinkRequestResponse {
  sent: true
}

export interface MagicLinkConsumeResponse {
  accessToken: string
}

export type EmploymentStatus = 'active' | 'dismissed'

/** Named feature permissions the UI cares about (subset of the backend catalog). */
export type FeaturePermission =
  | 'manage_roles'
  | 'change organisational relationships'
  | 'record a departure'
  | 'edit the career timeline'
  | 'maintain CDS records'
  | 'assign and end mentorships'
  | 'manage custom fields'

/** `GET /me` — the signed-in user's identity + capabilities (backend delta B2). */
export interface Me {
  id: string
  firstName: string
  lastName: string
  workEmail: string
  photo: string | null
  employmentStatus: EmploymentStatus
  permissions: FeaturePermission[]
}

// ---------------------------------------------------------------------------
// Directory
// ---------------------------------------------------------------------------

export interface UserListItem {
  id: string
  firstName: string
  lastName: string
  workEmail: string
  position: string
  country: string
  city: string
  workPhone: string | null
  birthDay: number | null
  birthMonth: number | null
  companyJoinDate: string
  employmentStatus: EmploymentStatus
}

export interface UserListResponse {
  items: UserListItem[]
  total?: number
  page?: number
  pageSize?: number
}

export interface UserListQuery {
  page?: number
  pageSize?: number
  employmentStatus?: 'dismissed'
  status?: 'active'
  country?: string
  city?: string
  position?: string
  firstName?: string
  lastName?: string
  workEmail?: string
  workPhone?: string
  companyJoinDate?: string
  birthDay?: number
  birthMonth?: number
  ids?: string
}

// ---------------------------------------------------------------------------
// Profile — S1 identity + embedded S11/S13, plus header relations (B3)
// ---------------------------------------------------------------------------

export interface Identity {
  firstName: string
  lastName: string
  photo: string | null
  position: string
  country: string
  city: string
  workEmail: string
  workPhone: string | null
  birthDay: number | null
  birthMonth: number | null
  companyJoinDate: string
}

export interface PersonRef {
  id: string
  name: string
}

export interface MentorshipPair {
  id: string
  kind: 'pair'
  mentorId: string
  menteeId: string
  status: string
}

export type SectionKey =
  | 's1'
  | 's2'
  | 's3'
  | 's4'
  | 's5'
  | 's6'
  | 's7'
  | 's8'
  | 's9'
  | 's10'
  | 's11'
  | 's12'
  | 's13'
  | 's14'
  | 's15'
  | 's16'

export type SectionLevel = 'none' | 'read' | 'write'

export interface UserProfile extends Identity {
  identity: Identity
  employmentStatus: EmploymentStatus
  projects: Array<{ id?: string; name: string }>
  /** Viewer's own none/read/write level per section (§3.3.5). Absent on an old backend. */
  access?: Record<SectionKey, SectionLevel>
  // Present only when the viewer has S13 access:
  openToMentoring?: boolean
  mentorship?: { pairs: MentorshipPair[] }
  department?: PersonRef
  manager?: PersonRef | null
  peoplePartner?: PersonRef | null
  mentor?: PersonRef | null
}

export interface PatchIdentityBody {
  position?: string
  country?: string
  city?: string
  workPhone?: string
  birthDay?: number
  birthMonth?: number
  workEmail?: string
  openToMentoring?: boolean
}

export interface PhotoUploadResponse {
  photoUrl: string
}

// ---------------------------------------------------------------------------
// Profile sections
// ---------------------------------------------------------------------------

export interface Employment {
  grade: string | null
  position: string
  employmentStatus: EmploymentStatus
}
export interface EmploymentResponse extends Employment {
  employment: Employment
}

export interface PersonalContacts {
  personalPhone: string | null
  personalEmail: string | null
  messengers: string | null
  residentialAddress: string | null
  currentPlaceOfStay: string | null
}
export interface PersonalContactsResponse extends PersonalContacts {
  personalcontacts: PersonalContacts
}

export interface EmergencyContacts {
  contactPerson: string | null
  relationship: string | null
  contactPhone: string | null
}
export interface EmergencyContactsResponse extends EmergencyContacts {
  emergencycontacts: EmergencyContacts
}

export interface DocumentRecord {
  id: string
  type: string
  title: string
}
export interface DocumentsResponse {
  documents: DocumentRecord[]
}

export type RiskLevel = 'low' | 'need attention' | 'medium' | 'high' | 'leaver'

export interface RiskRecord {
  id: string
  level: RiskLevel
  description: string
}
export interface RisksResponse {
  risks: RiskRecord[]
  level: RiskLevel | null
  description: string | null
}

export interface NoteRecord {
  id: string
  body: string
  visibleForEmployee: boolean
}
export interface NotesResponse {
  notes: NoteRecord[]
}

export interface FeedbackRecord {
  id: string
  body: string
  sharedWithEmployee: boolean
}
export interface FeedbacksResponse {
  feedbacks: FeedbackRecord[]
}

export interface CareerEvent {
  id: string
  userId?: string
  type: string
  source: 'system' | 'manual'
  eventDate: string
  details: Record<string, unknown>
  createdBy?: string
  createdAt?: string
  deletedAt?: string | null
}
export interface EventsResponse {
  careertimeline: CareerEvent[]
}
export interface AddEventBody {
  type?: string
  eventDate?: string
  details?: Record<string, unknown>
}

export interface LeavesResponse {
  leaves: unknown[]
}

export interface AssessmentsResponse {
  cds: { skillsMatrixLink: string | null }
  cycle: string | null
}

export interface CustomFieldsResponse {
  customfields: Record<string, unknown>
  [key: string]: unknown
}

export interface ActionItem {
  id: string
  assigneeId: string
  title: string
  status: string
  completedAt?: string
}
export interface ActionItemsResponse {
  actionitems: ActionItem[]
}

export interface MentorshipPairsResponse {
  pairs: MentorshipPair[]
}

export interface RequestHistoryResponse {
  requesthistory: unknown[]
}

// ---------------------------------------------------------------------------
// Organisational relationships & departure
// ---------------------------------------------------------------------------

export type RelationshipField = 'manager' | 'people_partner' | 'department'

export interface RelationshipChangeBody {
  field: RelationshipField
  value: string | null
  expectedCurrent?: string | null
}

export interface DepartmentManagerChangeBody {
  value: string | null
  expectedCurrent?: string | null
}

export interface DepartureBody {
  effectiveDate: string
  reason?: string
}
export interface DepartureResponse {
  id: string
  userId: string
  effectiveDate: string
  reason: string
  appliedAt: string | null
}

// ---------------------------------------------------------------------------
// Access-control admin — roles
// ---------------------------------------------------------------------------

export interface RolePolicy {
  id: string
  name: string
  holderCount: number
  holders: Array<{ id: string; workEmail: string }>
}
