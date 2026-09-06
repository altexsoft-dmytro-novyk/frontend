import { describe, it, expect } from 'vitest'
import {
  getAccessJournalApiCall,
  getRelationshipsApiCall,
  assignManagerApiCall,
  deleteRelationshipApiCall,
  changePeoplePartnerApiCall,
  removePeoplePartnerApiCall,
} from '@/api/organisation'
import {
  newProvider,
  useMockServer,
  bearerMatcher,
  uuidish,
  isoTimestamp,
  like,
  eachLike,
  string,
  regex,
} from './support/pact-setup'

const SUBJECT = '01920000-0000-7000-8000-000000000001'
const TARGET = '01920000-0000-7000-8000-000000000002'
const REL = '01920000-0000-7000-8000-0000000000a1'
/** The People Partner in place before a replacement — the token's expected value. */
const CURRENT_PP = '01920000-0000-7000-8000-000000000003'

/**
 * Organisational relationships (backend Epic 4 + Story 6.1).
 *
 * `GET /users/:id/relationships` is the route the whole org screen now depends
 * on: it supplies the `relationshipId` a DEC-UM-005 reassignment needs
 * (explicit DELETE-then-POST) and the `expectedCurrentTargetId` the People
 * Partner optimistic-concurrency token is seeded from. Both are ids the UI can
 * obtain nowhere else, so their presence and their names are contractual.
 */
describe('GET /users/:id/relationships', () => {
  it('returns current manager and People Partner edges with their ids', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer who may read the target employee current relationships')
      .uponReceiving('a request for current organisational relationships')
      .withRequest({
        method: 'GET',
        path: `/api/v1/users/${SUBJECT}/relationships`,
        headers: { Authorization: bearerMatcher },
      })
      .willRespondWith({
        status: 200,
        body: {
          data: eachLike({
            relationshipId: uuidish(REL),
            type: regex('direct|people_partner', 'direct'),
            target: {
              id: uuidish(TARGET),
              firstName: string('Grace'),
              lastName: string('Hopper'),
            },
          }),
        },
      })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      const result = await getRelationshipsApiCall(SUBJECT)
      const edge = result.data[0]
      expect(edge.relationshipId).toBeTruthy()
      expect(edge.type).toMatch(/^(direct|people_partner)$/)
      expect(edge.target.firstName).toBeTruthy()
      expect(edge.target.lastName).toBeTruthy()
    })
  })
})

describe('POST /users/:id/relationships — assign a manager', () => {
  it('sends the direct-edge payload and reads back the created edge', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer holding organisation write access and an assignable target')
      .uponReceiving('a manager assignment')
      .withRequest({
        method: 'POST',
        path: `/api/v1/users/${SUBJECT}/relationships`,
        headers: { Authorization: bearerMatcher, 'Content-Type': 'application/json' },
        body: { type: 'direct', targetId: uuidish(TARGET) },
      })
      .willRespondWith({
        status: 201,
        // A bare edge, not a `{ data }` envelope — the UI reads `id` off the
        // top level to keep working without a re-read.
        body: {
          id: uuidish(REL),
          userId: uuidish(SUBJECT),
          type: string('direct'),
          reportsToUserId: like(TARGET),
        },
      })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      const edge = await assignManagerApiCall(SUBJECT, TARGET)
      expect(edge).not.toHaveProperty('data')
      expect(edge.id).toBeTruthy()
      expect(edge.type).toBe('direct')
    })
  })

  it('hard-deletes an edge by id', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer holding organisation write access and an existing manager edge')
      .uponReceiving('a manager edge deletion')
      .withRequest({
        method: 'DELETE',
        path: `/api/v1/users/${SUBJECT}/relationships/${REL}`,
        headers: { Authorization: bearerMatcher },
      })
      // 200, not 204: `relationships.controller.ts` marks both relationship
      // deletes `@HttpCode(HttpStatus.OK)` with an empty body, while the
      // career-event delete on `users.controller.ts` is a 204. The contract
      // records the backend as it is; the inconsistency is reported, not
      // papered over.
      .willRespondWith({ status: 200 })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      await expect(deleteRelationshipApiCall(SUBJECT, REL)).resolves.toBe('')
    })
  })
})

describe('/users/:id/relationships/people-partner', () => {
  it('carries the optimistic-concurrency token on a replace', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer holding organisation write access and a current People Partner')
      .uponReceiving('a People Partner replacement carrying the expected current target')
      .withRequest({
        method: 'PUT',
        path: `/api/v1/users/${SUBJECT}/relationships/people-partner`,
        headers: { Authorization: bearerMatcher, 'Content-Type': 'application/json' },
        body: { targetId: uuidish(TARGET), expectedCurrentTargetId: uuidish(CURRENT_PP) },
      })
      .willRespondWith({
        status: 200,
        body: {
          id: uuidish(REL),
          userId: uuidish(SUBJECT),
          type: string('people_partner'),
          reportsToUserId: like(TARGET),
        },
      })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      const edge = await changePeoplePartnerApiCall(SUBJECT, TARGET, CURRENT_PP)
      expect(edge.type).toBe('people_partner')
    })
  })

  it('sends the token as a query param on a removal', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer holding organisation write access and a current People Partner')
      .uponReceiving('a People Partner removal carrying the expected current target')
      .withRequest({
        method: 'DELETE',
        path: `/api/v1/users/${SUBJECT}/relationships/people-partner`,
        // Body-less verb, so the token has to travel as a query param. The
        // backend reads it from there; a move to a body would be silent.
        query: { expectedCurrentTargetId: CURRENT_PP },
        headers: { Authorization: bearerMatcher },
      })
      // 200 with an empty body — same `@HttpCode(HttpStatus.OK)` as above.
      .willRespondWith({ status: 200 })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      await expect(removePeoplePartnerApiCall(SUBJECT, CURRENT_PP)).resolves.toBe('')
    })
  })
})

describe('GET /users/:id/access-journal', () => {
  it('returns append-only rows with no capability hint', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer who may read the target employee access journal')
      .uponReceiving('a request for the access journal')
      .withRequest({
        method: 'GET',
        path: `/api/v1/users/${SUBJECT}/access-journal`,
        headers: { Authorization: bearerMatcher },
      })
      .willRespondWith({
        status: 200,
        body: {
          data: eachLike({
            id: uuidish('01920000-0000-7000-8000-0000000000a1'),
            occurredAt: isoTimestamp('2026-01-15T10:30:00.000Z'),
            actorUserId: uuidish(TARGET),
            subjectUserId: like(SUBJECT),
            kind: regex(
              'manager|people_partner|department_membership|department_manager|full_profile_grant|full_profile_revoke|shared_link_access',
              'manager'
            ),
            before: like(null),
            after: like({}),
          }),
        },
      })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      const journal = await getAccessJournalApiCall(SUBJECT)
      expect(Array.isArray(journal.data)).toBe(true)
      // Append-only: the envelope must not grow a `canEdit`, or the screen
      // would start offering edits the backend rejects.
      expect(journal).not.toHaveProperty('canEdit')
      expect(journal.data[0].occurredAt).toBeTruthy()
    })
  })
})
