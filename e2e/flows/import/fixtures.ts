/**
 * Test DATA for the population-import flow. No network logic here — see helpers.ts.
 */

const base64url = (value: object): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

export const SESSION_STORAGE_KEY = 'pp.session'

/** A syntactically valid, unsigned JWT with a far-future `exp` (year 2100). */
export const SEEDED_SESSION_JWT = [
  base64url({ alg: 'HS256', typ: 'JWT' }),
  base64url({
    sub: '22222222-2222-4222-8222-222222222222',
    iat: 1_700_000_000,
    exp: 4_102_444_800,
  }),
  'test-signature-not-verified-client-side',
].join('.')

export interface ImportSummary {
  created: number
  updated: number
  departmentsCreated: number
  skipped: number
  errors: { line: number; email: string | null; reason: string }[]
}

export const cleanSummary = (overrides: Partial<ImportSummary> = {}): ImportSummary => ({
  created: 512,
  updated: 0,
  departmentsCreated: 8,
  skipped: 0,
  errors: [],
  ...overrides,
})

export const partialSummary = (): ImportSummary => ({
  created: 509,
  updated: 1,
  departmentsCreated: 8,
  skipped: 3,
  errors: [
    { line: 14, email: 'no.name@example.com', reason: 'first name is required' },
    { line: 92, email: null, reason: 'email is required' },
    { line: 140, email: 'dup@example.com', reason: 'email already exists' },
  ],
})

export const HEADER_MISMATCH_400 = {
  statusCode: 400,
  message: 'the file header does not match the expected timetracker export columns',
}

interface DirectoryRow {
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
  companyJoinDate: string
  employmentStatus: 'active' | 'dismissed'
}

export const DIRECTORY_ROW: DirectoryRow = {
  id: 'emp-1',
  firstName: 'Amelia',
  lastName: 'Rho',
  photo: null,
  position: 'Senior Engineer',
  country: 'Poland',
  city: 'Kraków',
  workEmail: 'amelia.rho@example.com',
  workPhone: null,
  birthDay: 12,
  birthMonth: 8,
  companyJoinDate: '2021-03-01',
  employmentStatus: 'active',
}

export const emptyDirectory = () => ({
  items: [] as DirectoryRow[],
  page: 1,
  pageSize: 25,
  total: 0,
  totalPages: 0,
})

export const populatedDirectory = (rows: DirectoryRow[] = [DIRECTORY_ROW]) => ({
  items: rows,
  page: 1,
  pageSize: 25,
  total: rows.length,
  totalPages: 1,
})

export type { DirectoryRow }
