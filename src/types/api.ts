/**
 * API response TypeScript interfaces
 */

// Common API error response structure
export interface ApiError {
  message: string
  status: number
  error?: unknown
}
