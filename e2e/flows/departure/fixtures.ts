/**
 * Test DATA for the departure-workflow flow. No network logic here — see
 * helpers.ts.
 */

const base64url = (value: object): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

export const SESSION_STORAGE_KEY = 'pp.session'

/** The signed-in actor (JWT `sub`). */
export const ACTOR_USER_ID = '22222222-2222-4222-8222-222222222222'
/** The employee whose Departure screen is open. */
export const SUBJECT_USER_ID = '33333333-3333-4333-8333-333333333333'
/** The default re-parent target (the departing person's own manager). */
export const MANAGER_USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
/** A second directory person, picked via "choose someone else". */
export const OTHER_TARGET_USER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

export const DEPARTURE_ID = 'dep-11111111-1111-4111-8111-111111111111'

/** Comfortably in the future so the client-side future-date check always passes. */
export const FUTURE_DATE = '2099-06-01'

export const SEEDED_SESSION_JWT = [
  base64url({ alg: 'HS256', typ: 'JWT' }),
  base64url({ sub: ACTOR_USER_ID, iat: 1_700_000_000, exp: 4_102_444_800 }),
  'test-signature-not-verified-client-side',
].join('.')

export interface DepartureViewData {
  departureId: string
  userId: string
  state: 'scheduled' | 'processing' | 'retry_wait' | 'applied'
  effectiveDate: string
  effectiveTimeZone: string
  dueAt: string
  reason: string
  createdAt: string
  attempts?: number
  lastError?: string | null
  appliedAt?: string | null
}

export const departureView = (overrides: Partial<DepartureViewData> = {}): DepartureViewData => ({
  departureId: DEPARTURE_ID,
  userId: SUBJECT_USER_ID,
  state: 'scheduled',
  effectiveDate: FUTURE_DATE,
  effectiveTimeZone: 'Europe/Warsaw',
  dueAt: `${FUTURE_DATE}T00:00:00.000Z`,
  reason: 'Relocating abroad',
  createdAt: '2026-09-03T10:00:00.000Z',
  ...overrides,
})

export const EXPECTED_BLOCKER_VERSION = 'v1:aGFzaC1vZi1ibG9ja2Vycw'

export const blockedBody = (overrides: Record<string, unknown> = {}) => ({
  error: 'departure_blocked_by_responsibilities',
  blockers: [
    {
      kind: 'direct_report',
      summary: 'Manages 2 direct reports',
      targets: [
        { userId: 'r1', name: 'Ada Lovelace' },
        { userId: 'r2', name: 'Grace Hopper' },
      ],
    },
    {
      kind: 'people_partner',
      summary: 'Assigned People Partner for 1 person',
      targets: [{ userId: 'p1', name: 'Alan Turing' }],
    },
  ],
  expectedBlockerVersion: EXPECTED_BLOCKER_VERSION,
  defaultReparentTargetId: MANAGER_USER_ID,
  ...overrides,
})

export const reparentResult = (remainingExternalBlockers = 0) => ({
  reassigned: { directReports: 2, departmentManager: false, peoplePartnerAssignments: 1 },
  remainingExternalBlockers,
})

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

export const DIRECTORY_ROWS: DirectoryRow[] = [
  {
    id: MANAGER_USER_ID,
    firstName: 'Nadia',
    lastName: 'Okoro',
    photo: null,
    position: 'Engineering Manager',
    country: 'Nigeria',
    city: 'Lagos',
    workEmail: 'nadia.okoro@example.com',
    workPhone: null,
    birthDay: 4,
    birthMonth: 4,
    companyJoinDate: '2019-05-01',
    employmentStatus: 'active',
  },
  {
    id: OTHER_TARGET_USER_ID,
    firstName: 'Piotr',
    lastName: 'Zielinski',
    photo: null,
    position: 'Staff Engineer',
    country: 'Poland',
    city: 'Gdansk',
    workEmail: 'piotr.zielinski@example.com',
    workPhone: null,
    birthDay: null,
    birthMonth: null,
    companyJoinDate: '2020-09-01',
    employmentStatus: 'active',
  },
]

export const directoryPage = (rows: DirectoryRow[] = DIRECTORY_ROWS) => ({
  items: rows,
  page: 1,
  pageSize: 100,
  total: rows.length,
  totalPages: 1,
})

export const managerCard = () => ({
  data: {
    id: MANAGER_USER_ID,
    firstName: 'Nadia',
    lastName: 'Okoro',
    photo: null,
    position: 'Engineering Manager',
    country: 'Nigeria',
    city: 'Lagos',
    workEmail: 'nadia.okoro@example.com',
    workPhone: null,
    birthDay: 4,
    birthMonth: 4,
    companyJoinDate: '2019-05-01',
  },
  canEdit: false,
})

export type { DirectoryRow }
