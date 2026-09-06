import { describe, it, expect } from 'vitest'
import axios from 'axios'
import {
  recordDepartureApiCall,
  getDepartureApiCall,
  retryDepartureApiCall,
  reparentDepartureApiCall,
} from '@/api/departures'
import {
  fromProviderState,
  newProvider,
  useMockServer,
  bearerMatcher,
  uuidish,
  isoTimestamp,
  like,
  eachLike,
  string,
  integer,
  boolean,
  regex,
} from './support/pact-setup'

const SUBJECT = '01920000-0000-7000-8000-000000000001'
const TARGET = '01920000-0000-7000-8000-000000000002'
const DEPARTURE = '01920000-0000-7000-8000-0000000000d1'

/**
 * Departure workflow (backend Epic 5 / AD-20).
 *
 * The `409 departure_blocked_by_responsibilities` body is pinned as carefully
 * as the success one. It is not an error surface the UI merely displays: the
 * blocker panel branches on `blockers[].kind`, and `expectedBlockerVersion` is
 * echoed verbatim into the follow-up re-parenting command. A rename on either
 * would leave the remediation path dead while every green suite stayed green.
 */
describe('POST /users/:id/departures', () => {
  it('records a departure under an idempotency key', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer holding departure write access over an unblocked employee')
      .uponReceiving('a departure record request')
      .withRequest({
        method: 'POST',
        path: `/api/v1/users/${SUBJECT}/departures`,
        headers: {
          Authorization: bearerMatcher,
          'Content-Type': 'application/json',
          // Required by AD-20 — a resubmit without it is a duplicate write.
          'Idempotency-Key': like('9f1c4d2e-6b7a-4c3d-8e9f-0a1b2c3d4e5f'),
        },
        body: { effectiveDate: regex('\\d{4}-\\d{2}-\\d{2}', '2026-12-31'), reason: like('Resignation') },
      })
      .willRespondWith({
        status: 201,
        body: {
          departureId: uuidish(DEPARTURE),
          userId: uuidish(SUBJECT),
          state: regex('scheduled|processing|retry_wait|applied', 'scheduled'),
          effectiveDate: regex('\\d{4}-\\d{2}-\\d{2}', '2026-12-31'),
          effectiveTimeZone: string('Europe/Warsaw'),
          dueAt: isoTimestamp('2026-12-31T00:00:00.000Z'),
          reason: string('Resignation'),
          createdAt: isoTimestamp('2026-09-06T12:00:00.000Z'),
        },
      })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      const view = await recordDepartureApiCall(
        SUBJECT,
        { effectiveDate: '2026-12-31', reason: 'Resignation' },
        '9f1c4d2e-6b7a-4c3d-8e9f-0a1b2c3d4e5f'
      )
      expect(view.departureId).toBeTruthy()
      expect(view.state).toMatch(/^(scheduled|processing|retry_wait|applied)$/)
      // Worker internals must never reach the client.
      for (const secret of ['leaseToken', 'requestHash', 'idempotencyKey', 'nextAttemptAt']) {
        expect(view).not.toHaveProperty(secret)
      }
    })
  })

  it('answers 409 with the blocker set the remediation path consumes', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer and an employee whose active responsibilities block departure')
      .uponReceiving('a departure record request for an employee holding responsibilities')
      .withRequest({
        method: 'POST',
        path: `/api/v1/users/${SUBJECT}/departures`,
        headers: {
          Authorization: bearerMatcher,
          'Content-Type': 'application/json',
          'Idempotency-Key': like('9f1c4d2e-6b7a-4c3d-8e9f-0a1b2c3d4e5f'),
        },
        body: { effectiveDate: regex('\\d{4}-\\d{2}-\\d{2}', '2026-12-31'), reason: like('Resignation') },
      })
      .willRespondWith({
        status: 409,
        body: {
          error: string('departure_blocked_by_responsibilities'),
          blockers: eachLike({
            kind: regex('direct_report|department_manager|people_partner', 'direct_report'),
            summary: string('2 direct reports'),
          }),
          expectedBlockerVersion: string('sha256:6c1f0a'),
        },
      })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      const failure = await recordDepartureApiCall(
        SUBJECT,
        { effectiveDate: '2026-12-31', reason: 'Resignation' },
        '9f1c4d2e-6b7a-4c3d-8e9f-0a1b2c3d4e5f'
      ).catch(error => error)

      expect(axios.isAxiosError(failure)).toBe(true)
      const body = failure.response.data
      expect(failure.response.status).toBe(409)
      expect(body.error).toBe('departure_blocked_by_responsibilities')
      expect(body.expectedBlockerVersion).toBeTruthy()
      expect(body.blockers[0].kind).toMatch(/^(direct_report|department_manager|people_partner)$/)
    })
  })
})

describe('GET /users/:id/departures/:departureId', () => {
  it('exposes sanitized diagnostics for a failed attempt', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer and a departure that has failed at least one attempt')
      .uponReceiving('a departure status request')
      .withRequest({
        method: 'GET',
        path: `/api/v1/users/${SUBJECT}/departures/${DEPARTURE}`,
        headers: { Authorization: bearerMatcher },
      })
      .willRespondWith({
        status: 200,
        body: {
          departureId: uuidish(DEPARTURE),
          userId: uuidish(SUBJECT),
          state: regex('scheduled|processing|retry_wait|applied', 'retry_wait'),
          effectiveDate: regex('\\d{4}-\\d{2}-\\d{2}', '2026-12-31'),
          effectiveTimeZone: string('Europe/Warsaw'),
          dueAt: isoTimestamp('2026-12-31T00:00:00.000Z'),
          reason: string('Resignation'),
          createdAt: isoTimestamp('2026-09-06T12:00:00.000Z'),
          attempts: integer(1),
          lastError: like('downstream_unavailable'),
        },
      })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      const view = await getDepartureApiCall(SUBJECT, DEPARTURE)
      expect(view.attempts).toBeGreaterThanOrEqual(0)
      expect(view).not.toHaveProperty('leaseToken')
    })
  })
})

describe('POST /users/:id/departures/:departureId/retry', () => {
  it('accepts a retry with no body', async () => {
    const provider = newProvider()
    provider
      .given('an authenticated viewer and a departure in retry_wait')
      .uponReceiving('a departure retry request')
      .withRequest({
        method: 'POST',
        path: `/api/v1/users/${SUBJECT}/departures/${DEPARTURE}/retry`,
        headers: { Authorization: bearerMatcher },
      })
      .willRespondWith({ status: 202 })

    await provider.executeTest(async mockServer => {
      useMockServer(`${mockServer.url}/api/v1`)
      await expect(retryDepartureApiCall(SUBJECT, DEPARTURE)).resolves.toBe('')
    })
  })
})

/**
 * DEFERRED — `POST /users/:id/departure-reparenting` is not in the enforced
 * contract.
 *
 * `expectedBlockerVersion` is a digest the backend derives from the live
 * blocker set, and a stale one is a 409 by design, so no fixed example can ever
 * verify. The correct tool is a `fromProviderState` placeholder filled by the
 * state handler; wiring it up here did not land the injected value, and a
 * hard-coded digest would only ever record a false red.
 *
 * Follow-up: finish the `fromProviderState` injection. The blocker RESPONSE is
 * already pinned by the 409 interaction above, which is the half the UI branches
 * on; what is missing is the command that echoes the digest back.
 */
