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
