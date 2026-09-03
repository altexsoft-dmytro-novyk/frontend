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
