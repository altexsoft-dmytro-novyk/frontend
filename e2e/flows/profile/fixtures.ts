/**
 * Test DATA for the employee-profile flow. No network logic here — see helpers.ts.
 */

interface S1IdentityCard {
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
}

interface CareerEvent {
  id: string
  type: string
  eventDate: string
  details: unknown
  source: string
  createdAt: string
}

const base64url = (value: object): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

export const SESSION_STORAGE_KEY = 'pp.session'

/** The JWT `sub` — `useAuth().userId`; the profile at this id is "my own". */
export const OWN_USER_ID = '22222222-2222-4222-8222-222222222222'
/** Someone else's id — the profile at this id is not mine. */
export const OTHER_USER_ID = '33333333-3333-4333-8333-333333333333'

export const SEEDED_SESSION_JWT = [
  base64url({ alg: 'HS256', typ: 'JWT' }),
  base64url({ sub: OWN_USER_ID, iat: 1_700_000_000, exp: 4_102_444_800 }),
  'test-signature-not-verified-client-side',
].join('.')

export const OTHER_CARD: S1IdentityCard = {
  id: OTHER_USER_ID,
  firstName: 'Carla',
  lastName: 'Mendes',
  photo: null,
  position: 'Data Scientist',
  country: 'Portugal',
  city: null,
  workEmail: 'carla.mendes@example.com',
  workPhone: null,
  birthDay: 3,
  birthMonth: 1,
  companyJoinDate: '2026-02-02',
}

export const OWN_CARD: S1IdentityCard = {
  id: OWN_USER_ID,
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
}

export const cardResponse = (card: S1IdentityCard, canEdit = false) => ({ data: card, canEdit })

export const EVENTS: CareerEvent[] = [
  {
    id: 'evt-1',
    type: 'position_change',
    eventDate: '2023-01-10',
    details: { from: 'Engineer', to: 'Senior Engineer' },
    source: 'system',
    createdAt: '2023-01-10T09:00:00.000Z',
  },
  {
    id: 'evt-2',
    type: 'certification',
    eventDate: '2024-06-01',
    details: {},
    source: 'manual',
    createdAt: '2024-06-01T09:00:00.000Z',
  },
]

export const eventsResponse = (data: CareerEvent[], canEdit = false) => ({ data, canEdit })

export type { S1IdentityCard, CareerEvent }
