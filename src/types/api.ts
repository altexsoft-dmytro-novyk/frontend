/**
 * API response TypeScript interfaces
 */

// Common API error response structure
export interface ApiError {
  message: string
  status: number
  error?: unknown
}

/**
 * Magic-link authentication (`services/backend` Epic 2 — `/auth`).
 */

// POST /auth/magic-link
export interface RequestMagicLinkPayload {
  email: string
}

// Enumeration-safe: byte-identical for known / unknown / inactive addresses.
export interface RequestMagicLinkResponse {
  sent: true
}

// POST /auth/magic-link/consume
export interface ConsumeMagicLinkPayload {
  token: string
}

// Success body of POST /auth/magic-link/consume (every failure is a bare 401).
// Mirrors backend `EstablishedSession` (magic-link.service.ts).
export interface EstablishedSession {
  sessionToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

/**
 * Employee directory (`services/backend` Story 1.5 — `GET /users`).
 */

// Shared envelope for any paginated list endpoint — mirrors backend
// `PaginatedResponseDto` (`common/dtos/paginated-response.dto.ts`).
export interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// One row of `GET /users` — mirrors backend `UserListItem`
// (`user-management/application/dtos/user-list-item.response.ts`). This is the
// complete projection the backend sends per row: no grade / risk / department /
// project / mentorship fields exist here.
export interface EmployeeListItem {
  id: string
  firstName: string
  lastName: string
  photo: string | null
  position: string
  country: string
  city: string | null
  workEmail: string
  workPhone: string | null
  birthDay: number | null
  birthMonth: number | null
  /** `YYYY-MM-DD` (date-only). */
  companyJoinDate: string
  employmentStatus: 'active' | 'dismissed'
}

// The ONLY query params `GET /users` accepts (Story 1.5). Filters are plain
// equality (exact match). Any other key makes the API answer `400`, so the
// request layer must never send one. `employmentStatus` unset = active only.
export interface EmployeeListParams {
  page?: number
  pageSize?: number
  firstName?: string
  lastName?: string
  position?: string
  country?: string
  city?: string
  workEmail?: string
  workPhone?: string
  birthDay?: number
  birthMonth?: number
  companyJoinDate?: string
  employmentStatus?: 'active' | 'dismissed'
}

/**
 * Employee profile — the S1 identity card (`services/backend` Story 1.2 —
 * `GET /users/:id`).
 */

// The EXACT 12 fields `GET /users/:id` returns in `data` — mirrors backend
// `S1IdentityCard` (`user-management/application/dtos/user-card.response.ts`).
// No derived manager / People Partner / department / mentor rows: the backend
// does not send them on this route.
export interface S1IdentityCard {
  id: string
  firstName: string
  lastName: string
  /** A full storage URL (or `null`) — render directly in `<img>` with a fallback. */
  photo: string | null
  position: string
  country: string
  city: string | null
  workEmail: string
  workPhone: string | null
  birthDay: number | null
  birthMonth: number | null
  /** `YYYY-MM-DD` (date-only). */
  companyJoinDate: string
}

// `GET /users/:id` success body — the identity card plus the S1 write-access
// hint. `canEdit` is `true` only for the target's reporting-line manager or
// assigned People Partner; the UI never re-derives access.
export interface UserCardResponse {
  data: S1IdentityCard
  canEdit: boolean
}

// The only keys `PATCH /users/:id` accepts (Story 1.2). Any of
// manager/PP/department/employmentStatus/customFields/photo/isActive is
// rejected `400` by design, so the edit form never offers them. Only the
// changed subset is sent.
export interface UpdateIdentityCardPayload {
  firstName?: string
  lastName?: string
  position?: string
  country?: string
  city?: string
  workEmail?: string
  workPhone?: string
  birthDay?: number
  birthMonth?: number
  companyJoinDate?: string
}

/**
 * Career timeline (`services/backend` Story 3.1 — `GET /users/:id/events`).
 */

// One timeline row — mirrors backend `UserEventResponse`. `details` is an
// arbitrary object (`{ from: 'Engineer', to: 'Senior Engineer' }`, etc.) or
// empty. `source` is `'manual'` (human backfill) or `'system'` (server-written,
// e.g. a position change). Order: `eventDate asc, createdAt asc`.
export interface CareerEvent {
  id: string
  type: string
  /** `YYYY-MM-DD` (date-only). */
  eventDate: string
  details: unknown
  source: string
  createdAt: string
}

// `GET /users/:id/events` success body — the owned timeline plus the manual
// add/delete capability hint (`true` for a `profile:timeline:write` holder).
// NOT a pagination envelope.
export interface CareerTimelineResponse {
  data: CareerEvent[]
  canEdit: boolean
}

// `POST /users/:id/events` body (Story 3.2). `details` is omitted entirely when
// blank. There is no edit route — a correction is delete + re-add.
export interface CreateCareerEventPayload {
  type: string
  /** `YYYY-MM-DD`. */
  eventDate: string
  details?: Record<string, unknown>
}

/**
 * Organisational relationships (`services/backend` Epic 4 — the dedicated
 * organisational-relationship screen). Only the fully-operable slice is wired:
 * first manager assignment, People-Partner assign/replace/remove, and the
 * access-journal read. Department membership / department manager /
 * manager reassignment stay deferred (`deferred-work.md`) — no read endpoint
 * backs them yet.
 */

// The `kind` discriminator on an access-journal row — mirrors the backend
// `AccessJournal.kind` enum (`access-journal.response.ts`). This screen only
// derives from `manager` / `people_partner`; the rest render as plain history.
export type AccessJournalKind =
  | 'manager'
  | 'people_partner'
  | 'department_membership'
  | 'department_manager'
  | 'full_profile_grant'
  | 'full_profile_revoke'
  | 'shared_link_access'

// One `GET /users/:id/access-journal` row — mirrors backend
// `AccessJournalRowResponse`. Append-only: the envelope carries no `canEdit`.
// `before` / `after` are opaque snapshots (`{ relationshipId, userId, type,
// reportsToUserId }` for `manager` / `people_partner` rows, or `null`).
export interface AccessJournalRow {
  id: string
  /** ISO-8601 timestamp. */
  occurredAt: string
  actorUserId: string
  subjectUserId: string | null
  subjectDepartmentId?: string
  kind: AccessJournalKind
  before: unknown
  after: unknown
}

// `GET /users/:id/access-journal` success body — newest-first, no `canEdit`.
export interface AccessJournalResponse {
  data: AccessJournalRow[]
}

// The bare relationship edge returned by `POST /users/:id/relationships` and
// `PUT /users/:id/relationships/people-partner` — mirrors backend
// `RelationshipResponse`. Not a `{ data }` envelope.
export interface RelationshipEdge {
  id: string
  userId: string
  type: string
  reportsToUserId: string | null
}

// `POST /users/:id/relationships` body (Story 4.1). `type` is `'direct'` only —
// project edges are TimeTracker-sync-owned, PP has its own `PUT` route.
export interface AssignManagerPayload {
  type: 'direct'
  targetId: string
}

// `PUT /users/:id/relationships/people-partner` body (Story 4.2). The optimistic
// -concurrency token `expectedCurrentTargetId` is intentionally omitted — it
// needs a current-PP read the backend does not expose yet, so the UI does an
// unconditional replace (`deferred-work.md`).
export interface ChangePeoplePartnerPayload {
  targetId: string
}

/**
 * Departure workflow (`services/backend` Epic 5 — `POST /users/:id/departures`,
 * blocker re-parenting, status, retry). Mirrors the AD-20 "concrete shapes"
 * (`api-conventions.md` §Departure) and the backend `DepartureView` /
 * `buildBlockedResponse` / `DepartureReparentingResponse`.
 */

// The lifecycle states the worker moves a departure through. `scheduled` until
// `dueAt`; `processing` / `retry_wait` while the worker runs; `applied` is
// terminal.
export type DepartureState = 'scheduled' | 'processing' | 'retry_wait' | 'applied'

// `GET /users/:id/departures/:departureId` (and the record `201`) body — the
// bare projection, no envelope. `attempts` / `lastError` are present only for a
// non-`scheduled` state; `appliedAt` only once `applied`. Never carries
// `leaseToken` / `requestHash` / `idempotencyKey` / `nextAttemptAt`.
export interface DepartureView {
  departureId: string
  userId: string
  state: DepartureState
  /** `YYYY-MM-DD` (date-only). */
  effectiveDate: string
  effectiveTimeZone: string
  /** ISO-8601 timestamp — `00:00` on `effectiveDate` in `effectiveTimeZone`. */
  dueAt: string
  reason: string
  createdAt: string
  attempts?: number
  lastError?: string | null
  appliedAt?: string | null
}

// The `kind` discriminator on a blocking responsibility.
export type DepartureBlockerKind = 'direct_report' | 'department_manager' | 'people_partner'

// One entry of the `409 departure_blocked_by_responsibilities` `blockers[]`.
// `targets` is present for `direct_report` / `people_partner`; `departmentId` /
// `departmentName` for `department_manager`.
export interface DepartureBlocker {
  kind: DepartureBlockerKind
  summary: string
  targets?: { userId: string; name: string }[]
  departmentId?: string
  departmentName?: string
}

// `POST /users/:id/departures` → `409` body when active responsibilities block
// the departure. `expectedBlockerVersion` is an opaque server digest echoed
// verbatim into the re-parenting command.
export interface BlockedDepartureResponse {
  error: 'departure_blocked_by_responsibilities'
  blockers: DepartureBlocker[]
  expectedBlockerVersion: string
  defaultReparentTargetId?: string
}

// `POST /users/:id/departures` body (AD-20). Client-validated: `effectiveDate` a
// real future date, `reason` non-empty.
export interface RecordDeparturePayload {
  /** `YYYY-MM-DD`. */
  effectiveDate: string
  reason: string
}

// `POST /users/:id/departure-reparenting` body. `expectedBlockerVersion` is
// echoed verbatim from the blocker response.
export interface ReparentDeparturePayload {
  targetId: string
  expectedBlockerVersion: string
}

// `POST /users/:id/departure-reparenting` → `200` body. `remainingExternalBlockers`
// is the count of timetracker-owned PM/DM blockers that re-parenting cannot
// clear (currently always `0` from the backend, but contractual — branch on it).
export interface ReparentingResult {
  reassigned: {
    directReports: number
    departmentManager: boolean
    peoplePartnerAssignments: number
  }
  remainingExternalBlockers: number
}
