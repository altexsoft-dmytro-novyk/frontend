/**
 * Test DATA for the magic-link auth flow. No network logic here — see helpers.ts.
 */

// Mirrors backend `EstablishedSession` (see src/types/api.ts). Kept inline so
// this fixture module has no dependency on the app's path aliases.
interface EstablishedSession {
  sessionToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

const base64url = (value: object): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

/** Stable id used as the JWT `sub` — what `useAuth().userId` should resolve to. */
export const TEST_USER_ID = '11111111-1111-4111-8111-111111111111'

/** A syntactically valid, unsigned JWT with a far-future `exp` (year 2100). */
export const VALID_SESSION_JWT = [
  base64url({ alg: 'HS256', typ: 'JWT' }),
  base64url({ sub: TEST_USER_ID, iat: 1_700_000_000, exp: 4_102_444_800 }),
  'test-signature-not-verified-client-side',
].join('.')

/** Same shape, but `exp` is in the past (2021) — must be treated as logged out. */
export const EXPIRED_SESSION_JWT = [
  base64url({ alg: 'HS256', typ: 'JWT' }),
  base64url({ sub: TEST_USER_ID, iat: 1_600_000_000, exp: 1_610_000_000 }),
  'test-signature-not-verified-client-side',
].join('.')

export const VALID_ESTABLISHED_SESSION: EstablishedSession = {
  sessionToken: VALID_SESSION_JWT,
  tokenType: 'Bearer',
  expiresIn: 3600,
}

export const SESSION_STORAGE_KEY = 'pp.session'

export const SEEDED_WORK_EMAIL = 'ada@example.com'
