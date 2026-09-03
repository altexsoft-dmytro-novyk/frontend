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
