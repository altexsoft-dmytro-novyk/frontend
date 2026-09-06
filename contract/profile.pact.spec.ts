import { describe, it, expect } from 'vitest'
import {
  getEmployeeApiCall,
  updateEmployeeApiCall,
  getCareerEventsApiCall,
  createCareerEventApiCall,
  deleteCareerEventApiCall,
} from '@/api/profile'
import {
  newProvider,
  useMockServer,
  bearerMatcher,
  uuidish,
  isoTimestamp,
  like,
  eachLike,
  string,
  boolean,
  regex,
} from './support/pact-setup'

const SUBJECT = '01920000-0000-7000-8000-000000000001'

/**
 * The S1 identity card (backend Story 1.2) and the career timeline
 * (Stories 3.1-3.3).
 *
 * Both envelopes carry a `canEdit` capability hint the UI trusts instead of
 * re-deriving access. That flag is the highest-risk field on the route: drop it
 * and the profile silently renders read-only for everyone, with no error to
 * catch it. It is pinned as a required boolean.
 */
describe('GET /users/:id — S1 identity card', () => {
  it('returns exactly the 12 card fields plus the write hint', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer who may read the target employee S1 card')
      .uponReceiving('a request for an employee identity card')
      .withRequest({
        method: 'GET',
        path: `/api/v1/users/${SUBJECT}`,
        headers: { Authorization: bearerMatcher },
      })
      .willRespondWith({
        status: 200,
        body: {
          data: {
            id: uuidish(SUBJECT),
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
          },
          canEdit: boolean(false),
        },
      })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      const card = await getEmployeeApiCall(SUBJECT)

      expect(typeof card.canEdit).toBe('boolean')
      expect(Object.keys(card.data).sort()).toEqual(
        [
          'birthDay',
          'birthMonth',
          'city',
          'companyJoinDate',
          'country',
          'firstName',
          'id',
          'lastName',
          'photo',
          'position',
          'workEmail',
          'workPhone',
        ].sort()
      )
      // The route must not leak the non-S1 columns the backend suite guards.
      for (const leaked of ['ttId', 'isActive', 'customFields', 'createdAt', 'createdBy']) {
        expect(card.data).not.toHaveProperty(leaked)
      }
    })
  })
})

describe('PATCH /users/:id — edit the card', () => {
  it('sends only the changed subset', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer holding S1 write access over the target employee')
      .uponReceiving('a partial identity-card update')
      .withRequest({
        method: 'PATCH',
        path: `/api/v1/users/${SUBJECT}`,
        headers: { Authorization: bearerMatcher, 'Content-Type': 'application/json' },
        // Exactly the touched keys. The route whitelists its body, so an
        // untouched key sent as undefined would be a 400.
        body: { position: like('Senior Engineer'), city: like('Warsaw') },
      })
      .willRespondWith({ status: 200, body: like({ id: uuidish(SUBJECT) }) })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      await expect(
        updateEmployeeApiCall(SUBJECT, { position: 'Senior Engineer', city: 'Warsaw' })
      ).resolves.toBeDefined()
    })
  })
})

describe('/users/:id/events — career timeline', () => {
  it('returns the owned timeline plus the manual-entry hint', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer who may read the target employee timeline')
      .uponReceiving('a request for the career timeline')
      .withRequest({
        method: 'GET',
        path: `/api/v1/users/${SUBJECT}/events`,
        headers: { Authorization: bearerMatcher },
      })
      .willRespondWith({
        status: 200,
        body: {
          data: eachLike({
            id: uuidish('01920000-0000-7000-8000-0000000000e1'),
            type: string('position_change'),
            eventDate: regex('\\d{4}-\\d{2}-\\d{2}', '2024-03-01'),
            details: like({}),
            source: regex('manual|system', 'system'),
            createdAt: isoTimestamp('2024-03-01T09:00:00.000Z'),
          }),
          canEdit: boolean(false),
        },
      })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      const timeline = await getCareerEventsApiCall(SUBJECT)
      expect(Array.isArray(timeline.data)).toBe(true)
      expect(typeof timeline.canEdit).toBe('boolean')
      expect(timeline).not.toHaveProperty('items')
      expect(timeline.data[0].source).toMatch(/^(manual|system)$/)
    })
  })

  it('creates a manual backfill entry', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer holding timeline write access over the target employee')
      .uponReceiving('a manual career-event creation')
      .withRequest({
        method: 'POST',
        path: `/api/v1/users/${SUBJECT}/events`,
        headers: { Authorization: bearerMatcher, 'Content-Type': 'application/json' },
        body: { type: like('promotion'), eventDate: regex('\\d{4}-\\d{2}-\\d{2}', '2025-06-01') },
      })
      .willRespondWith({ status: 201, body: like({ id: uuidish('01920000-0000-7000-8000-0000000000e2') }) })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      await expect(
        createCareerEventApiCall(SUBJECT, { type: 'promotion', eventDate: '2025-06-01' })
      ).resolves.toBeDefined()
    })
  })

  it('soft-deletes an entry', async () => {
    const eventId = '01920000-0000-7000-8000-0000000000e3'
    const provider = newProvider()
    provider
      .given('an authenticated viewer holding timeline write access and a deletable manual event')
      .uponReceiving('a career-event deletion')
      .withRequest({
        method: 'DELETE',
        path: `/api/v1/users/${SUBJECT}/events/${eventId}`,
        headers: { Authorization: bearerMatcher },
      })
      .willRespondWith({ status: 204 })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      // Typed `Promise<void>`, but axios resolves a 204 to an empty body
      // string. Asserted as-is rather than to the declared type: the contract
      // records what the wire does.
      await expect(deleteCareerEventApiCall(SUBJECT, eventId)).resolves.toBe('')
    })
  })
})
