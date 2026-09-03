/**
 * Test DATA for the employee-directory flow. No network logic here — see helpers.ts.
 */

interface EmployeeListItem {
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

interface PaginatedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export const SESSION_STORAGE_KEY = 'pp.session'

const base64url = (value: object): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

/**
 * A syntactically valid, unsigned JWT with a far-future `exp` (year 2100). It
 * carries only `sub`/`iat`/`exp` — no role or capability. `user-management:list`
 * gating is enforced server-side; these specs exercise the un-entitled path via
 * the `403` mock, not via anything in this token.
 */
export const SEEDED_SESSION_JWT = [
  base64url({ alg: 'HS256', typ: 'JWT' }),
  base64url({
    sub: '22222222-2222-4222-8222-222222222222',
    iat: 1_700_000_000,
    exp: 4_102_444_800,
  }),
  'test-signature-not-verified-client-side',
].join('.')

const ACTIVE_ROWS: EmployeeListItem[] = [
  {
    id: 'emp-1',
    firstName: 'Amelia',
    lastName: 'Rho',
    photo: null,
    position: 'Senior Engineer',
    country: 'Poland',
    city: 'Kraków',
    workEmail: 'amelia.rho@example.com',
    workPhone: '+48 111 222 333',
    birthDay: 12,
    birthMonth: 8,
    companyJoinDate: '2021-03-01',
    employmentStatus: 'active',
  },
  {
    id: 'emp-2',
    firstName: 'Bohdan',
    lastName: 'Serik',
    photo: null,
    position: 'Delivery Manager',
    country: 'Ukraine',
    city: null,
    workEmail: 'bohdan.serik@example.com',
    workPhone: null,
    birthDay: null,
    birthMonth: null,
    companyJoinDate: '2018-06-15',
    employmentStatus: 'active',
  },
  {
    id: 'emp-3',
    firstName: 'Carla',
    lastName: 'Mendes',
    photo: null,
    position: 'Data Scientist',
    country: 'Portugal',
    city: 'Lisbon',
    workEmail: 'carla.mendes@example.com',
    workPhone: '+351 900 000 000',
    birthDay: 3,
    birthMonth: 1,
    companyJoinDate: '2026-02-02',
    employmentStatus: 'active',
  },
]

const DISMISSED_ROWS: EmployeeListItem[] = [
  {
    id: 'emp-9',
    firstName: 'Hassan',
    lastName: 'Karim',
    photo: null,
    position: 'Analytics Engineer',
    country: 'Poland',
    city: 'Warsaw',
    workEmail: 'hassan.karim@example.com',
    workPhone: null,
    birthDay: 5,
    birthMonth: 8,
    companyJoinDate: '2023-09-01',
    employmentStatus: 'dismissed',
  },
]

const page = <T>(items: T[], total: number, pageNumber: number): PaginatedResponse<T> => ({
  items,
  page: pageNumber,
  pageSize: 25,
  total,
  totalPages: total === 0 ? 0 : Math.ceil(total / 25),
})

/** Default first page: 3 active rows, single page. */
export const ACTIVE_PAGE_1 = page(ACTIVE_ROWS, ACTIVE_ROWS.length, 1)

/** Poland-filtered result: one matching row. */
export const POLAND_PAGE_1 = page([ACTIVE_ROWS[0]], 1, 1)

/** Dismissed-status result. */
export const DISMISSED_PAGE_1 = page(DISMISSED_ROWS, DISMISSED_ROWS.length, 1)

/** Multi-page result — total 60, pageSize 25 → 3 pages. */
export const multiPage = (pageNumber: number): PaginatedResponse<EmployeeListItem> =>
  page([ACTIVE_ROWS[(pageNumber - 1) % ACTIVE_ROWS.length]], 60, pageNumber)

/** Empty result. */
export const EMPTY_PAGE = page<EmployeeListItem>([], 0, 1)

export type { EmployeeListItem, PaginatedResponse }
