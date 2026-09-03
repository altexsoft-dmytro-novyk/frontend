/**
 * Test DATA for the organisational-relationships flow. No network logic here —
 * see helpers.ts.
 */

interface AccessJournalRow {
  id: string
  occurredAt: string
  actorUserId: string
  subjectUserId: string | null
  subjectDepartmentId?: string
  kind: string
  before: unknown
  after: unknown
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

const base64url = (value: object): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

export const SESSION_STORAGE_KEY = 'pp.session'

/** The signed-in actor (JWT `sub`). */
export const ACTOR_USER_ID = '22222222-2222-4222-8222-222222222222'
/** The employee whose Organisation screen is open. */
export const SUBJECT_USER_ID = '33333333-3333-4333-8333-333333333333'
/** The person picked as a manager / People Partner in the happy paths. */
export const TARGET_USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
/** A second directory person. */
export const OTHER_TARGET_USER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'

export const SEEDED_SESSION_JWT = [
  base64url({ alg: 'HS256', typ: 'JWT' }),
  base64url({ sub: ACTOR_USER_ID, iat: 1_700_000_000, exp: 4_102_444_800 }),
  'test-signature-not-verified-client-side',
].join('.')

const managerSnapshot = (targetId: string) => ({
  relationshipId: 'rel-mgr-1',
  userId: SUBJECT_USER_ID,
  type: 'direct',
  reportsToUserId: targetId,
})

const ppSnapshot = (targetId: string) => ({
  relationshipId: 'rel-pp-1',
  userId: SUBJECT_USER_ID,
  type: 'people_partner',
  reportsToUserId: targetId,
})

/** Newest-first, as the API returns them. */
export const JOURNAL_ROWS: AccessJournalRow[] = [
  {
    id: 'evt-3',
    occurredAt: '2026-03-02T10:00:00.000Z',
    actorUserId: ACTOR_USER_ID,
    subjectUserId: SUBJECT_USER_ID,
    kind: 'people_partner',
    before: null,
    after: ppSnapshot('cccccccc-cccc-4ccc-8ccc-cccccccccccc'),
  },
  {
    id: 'evt-2',
    occurredAt: '2026-02-15T09:00:00.000Z',
    actorUserId: ACTOR_USER_ID,
    subjectUserId: SUBJECT_USER_ID,
    kind: 'manager',
    before: null,
    after: managerSnapshot('dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
  },
  {
    id: 'evt-1',
    occurredAt: '2026-01-10T08:00:00.000Z',
    actorUserId: ACTOR_USER_ID,
    subjectUserId: SUBJECT_USER_ID,
    kind: 'full_profile_grant',
    before: null,
    after: { grantedTo: ACTOR_USER_ID },
  },
]

/** Newest-first, a manager row but NO people_partner row — so the PP section
 * derives "none" and a first assignment needs no replace-confirm. */
export const MANAGER_ONLY_ROWS: AccessJournalRow[] = [
  {
    id: 'evt-2',
    occurredAt: '2026-02-15T09:00:00.000Z',
    actorUserId: ACTOR_USER_ID,
    subjectUserId: SUBJECT_USER_ID,
    kind: 'manager',
    before: null,
    after: managerSnapshot('dddddddd-dddd-4ddd-8ddd-dddddddddddd'),
  },
]

export const journalResponse = (rows: AccessJournalRow[]) => ({ data: rows })

export const DIRECTORY_ROWS: DirectoryRow[] = [
  {
    id: TARGET_USER_ID,
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
    lastName: 'Zieliński',
    photo: null,
    position: 'People Partner',
    country: 'Poland',
    city: 'Gdańsk',
    workEmail: 'piotr.zielinski@example.com',
    workPhone: null,
    birthDay: null,
    birthMonth: null,
    companyJoinDate: '2020-09-01',
    employmentStatus: 'active',
  },
  {
    id: SUBJECT_USER_ID,
    firstName: 'Sam',
    lastName: 'Rivera',
    photo: null,
    position: 'Software Engineer',
    country: 'Spain',
    city: 'Madrid',
    workEmail: 'sam.rivera@example.com',
    workPhone: null,
    birthDay: 1,
    birthMonth: 6,
    companyJoinDate: '2022-01-10',
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

export type { AccessJournalRow, DirectoryRow }
