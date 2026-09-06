/**
 * Shared harness for the consumer-driven contract suite.
 *
 * These tests exist because the Playwright suite mocks the API at the network
 * layer: every one of its 124 cases asserts the UI against a hand-written
 * fixture, so `src/types/api.ts` — which claims to mirror the backend DTOs — has
 * never been checked against the backend. Frontend green and backend green have
 * so far been independent facts.
 *
 * A contract test closes that. It drives the REAL request modules in
 * `src/api/**` through the REAL axios singleton (interceptors, auth header and
 * param pruning included) against a Pact mock provider, and records what went
 * over the wire. `services/backend` then replays that recording against a real
 * NestJS app, so a shape either side changes unilaterally fails somewhere.
 *
 * What belongs here: request shape (method, path, query, headers, body) and the
 * fields this app actually reads off the response. What does not: UI behaviour
 * (Playwright owns that) and backend business rules (the e2e suites own those).
 * Matchers stay loose on values and strict on structure — a contract pins the
 * shape, never the data.
 */
import * as path from 'node:path'
import { PactV3, SpecificationVersion, MatchersV3 } from '@pact-foundation/pact'
import { apiClient } from '@/api/client'

export const {
  like,
  eachLike,
  string,
  integer,
  boolean,
  regex,
  fromProviderState,
} = MatchersV3

export const CONSUMER = 'people-management-frontend'
export const PROVIDER = 'people-management-backend'

/** uuidv7 in this codebase, so the v4-only matcher would reject real ids. */
export const UUID_FORMAT = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
export const uuidish = (example: string) => regex(UUID_FORMAT, example)

/** ISO-8601 instant, e.g. `2026-09-06T12:00:00.000Z`. */
export const isoTimestamp = (example: string) =>
  regex('\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(Z|[+-]\\d{2}:\\d{2})', example)

/**
 * The id the provider seeds its contract viewer at
 * (`services/backend/test/contract/fixtures.ts` → `IDS.viewer`).
 */
export const CONTRACT_VIEWER_ID = '01920000-0000-7000-8000-0000000000f1'

/**
 * The session token the request interceptor attaches.
 *
 * The matcher is `Bearer .+`, so the contract pins that an Authorization bearer
 * is SENT, not which credential it carries — the app's real token is a JWT.
 * The EXAMPLE, though, is deliberately the `Bearer <token:<id>>` fixture
 * shorthand that `jwt-session-resolver.adapter.ts` accepts, naming the user the
 * provider states seed.
 *
 * That choice replaces the obvious alternative — a Pact `requestFilter` that
 * swaps the header in on the provider side. A requestFilter makes pact-js run
 * the whole verification through an Express proxy, and that proxy was observed
 * to corrupt the JSON body of `POST /auth/magic-link/consume`: verified alone
 * it failed with a 401 through the proxy and passed without it, while the same
 * request driven straight at the listener answered 200. Carrying a
 * self-sufficient example keeps the proxy out of the run entirely.
 */
export const SESSION_TOKEN = `<token:${CONTRACT_VIEWER_ID}>`
export const bearerMatcher = regex('Bearer .+', `Bearer ${SESSION_TOKEN}`)

export const newProvider = (): PactV3 =>
  new PactV3({
    consumer: CONSUMER,
    provider: PROVIDER,
    dir: path.resolve(__dirname, '../../pacts'),
    logLevel: 'warn',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V3,
  })

/**
 * Point the axios singleton at the ephemeral Pact mock server. The client is a
 * module-level instance built from `env.api.baseUrl` at import time, and Pact
 * allocates a fresh port per interaction, so the base URL is redirected rather
 * than the client rebuilt — that keeps the interceptors under test.
 */
export const useMockServer = (url: string): void => {
  apiClient.raw.defaults.baseURL = url
}
