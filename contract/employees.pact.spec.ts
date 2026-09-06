import { describe, it, expect } from 'vitest'
import { getEmployeesApiCall } from '@/api/employees'
import {
  newProvider,
  useMockServer,
  bearerMatcher,
  uuidish,
  like,
  eachLike,
  string,
  integer,
  regex,
} from './support/pact-setup'

/**
 * `GET /users` — the employee directory (backend Story 1.5).
 *
 * Pins the 13-key row projection `src/types/api.ts` claims (12 S1 card fields +
 * `employmentStatus`) and the offset envelope. The directory screen renders
 * every one of these keys, so a silent removal on the provider side is a broken
 * screen, not a tolerable change.
 */
describe('GET /users — employee directory', () => {
  // Every row the provider returns is matched against this template, so the
  // interaction has to address a deterministic set. `GET /users` reads a
  // database this suite shares with the e2e suites, where `photo`, `city`,
  // `workPhone`, `birthDay` and `birthMonth` are legitimately null on rows this
  // contract does not own — and Pact V3 has no union matcher to express
  // "string or null". Both interactions therefore filter on a position only the
  // contract fixtures use. That keeps the shape pinned; null-handling in the UI
  // stays covered by the Playwright fixtures.
  const CONTRACT_POSITION = 'Contract Engineer'

  const row = {
    id: uuidish('01920000-0000-7000-8000-000000000001'),
    firstName: string('Ada'),
    lastName: string('Lovelace'),
    photo: like('https://photos.example/ada.jpg'),
    position: string('Engineer'),
    country: string('PL'),
    city: like('Krakow'),
    workEmail: string('ada@company.example'),
    workPhone: like('+48 100 200 300'),
    birthDay: like(10),
    birthMonth: like(5),
    companyJoinDate: regex('\\d{4}-\\d{2}-\\d{2}', '2020-01-01'),
    employmentStatus: regex('active|dismissed', 'active'),
  }

  it('returns a paginated envelope of identity rows', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer holding user-management:list and at least one active employee')
      .uponReceiving('a first page request for the employee directory')
      .withRequest({
        method: 'GET',
        path: '/api/v1/users',
        query: { page: '1', pageSize: '25', position: CONTRACT_POSITION },
        headers: { Authorization: bearerMatcher },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': regex('application/json.*', 'application/json; charset=utf-8') },
        body: {
          items: eachLike(row),
          page: integer(1),
          pageSize: integer(25),
          total: integer(1),
          totalPages: integer(1),
        },
      })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      const result = await getEmployeesApiCall({
        page: 1,
        pageSize: 25,
        position: CONTRACT_POSITION,
      })

      expect(result.items.length).toBeGreaterThan(0)
      expect(Object.keys(result.items[0]).sort()).toEqual(
        [
          'birthDay',
          'birthMonth',
          'city',
          'companyJoinDate',
          'country',
          'employmentStatus',
          'firstName',
          'id',
          'lastName',
          'photo',
          'position',
          'workEmail',
          'workPhone',
        ].sort()
      )
      expect(result.totalPages).toBeGreaterThanOrEqual(1)
    })
  })

  it('sends only the filters that carry a value', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer holding user-management:list and at least one active employee')
      .uponReceiving('a directory request filtered by country')
      .withRequest({
        method: 'GET',
        path: '/api/v1/users',
        // `pruneParams` must drop the empty city and the undefined position:
        // `GET /users` answers 400 for an unknown or empty key, so an
        // unpruned request is a broken directory screen.
        query: { page: '1', pageSize: '25', position: CONTRACT_POSITION, country: 'PL' },
        headers: { Authorization: bearerMatcher },
      })
      .willRespondWith({
        status: 200,
        body: {
          items: eachLike(row),
          page: integer(1),
          pageSize: integer(25),
          total: integer(1),
          totalPages: integer(1),
        },
      })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      const result = await getEmployeesApiCall({
        page: 1,
        pageSize: 25,
        position: CONTRACT_POSITION,
        country: 'PL',
        city: '',
        workPhone: undefined,
      })
      expect(result.items[0].country).toBeDefined()
    })
  })
})
