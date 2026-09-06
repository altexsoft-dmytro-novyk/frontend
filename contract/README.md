# Consumer-driven contract suite

## Why this exists

The Playwright suite mocks the API at the network layer. All 124 of its cases
assert the UI against hand-written fixtures, and the backend e2e suites assert
the backend against its own fixtures. Both were green, independently, and
nothing checked that the two services agreed — `src/types/api.ts` claims to
mirror the backend DTOs and had never been verified against them.

These tests close that. The consumer half drives the real request modules in
`src/api/**` through the real axios singleton (interceptors, auth header and
param pruning included) against a Pact mock provider, and records what goes over
the wire. `services/backend` replays that recording against a real NestJS app on
a real migrated PostgreSQL. A shape either side changes unilaterally now fails
on one of the two.

## Running it

```bash
# consumer — writes pacts/people-management-frontend-people-management-backend.json
npm run test:contract

# provider — services/backend, needs Postgres up (npm run db:up)
npm --prefix ../backend run test:contract
```

The pact file is **merged, not overwritten**, between runs. Delete `pacts/`
before regenerating whenever interactions are removed or renamed, or the
provider will keep verifying interactions the consumer no longer declares.

## Scope

18 interactions over 14 endpoints: the directory, the S1 identity card and its
edit, the career timeline (read / create / delete), current relationships,
manager assign and delete, People Partner replace and remove, the access
journal, magic-link request, and the departure record / blocked-409 / status /
retry paths.

Pinned: request method, path, query, headers and body; and the response fields
this app actually reads. Not pinned: values (a contract fixes shape, not data),
UI behaviour (Playwright owns it) and backend business rules (the e2e suites own
them).

## Deliberately not covered

Three interactions were taken out rather than left recording a false red. Each is
a harness limitation, not a defect in the route:

1. **`POST /users/import`** — the multipart body is not captured by a plain
   `withRequest`, so the replay carries no `file` part and the route correctly
   answers 400. Needs `withRequestMultipartFileUpload`, which bypasses the app's
   own `FormData` construction and so trades away most of the value.
2. **`POST /auth/magic-link/consume`** — verified correct when driven straight at
   the listener (200 with `{ sessionToken, tokenType, expiresIn }`), but the
   token is single-use and the interaction proved sensitive to how Pact
   sequences state setup against the request.
3. **`POST /users/:id/departure-reparenting`** — `expectedBlockerVersion` is a
   digest derived from the live blocker set, so a fixed example is a 409 by
   design. Needs the `fromProviderState` injection finished. The blocked-409
   response it echoes IS pinned, which is the half the UI branches on.

## Auth

The Authorization matcher is `Bearer .+` — the contract pins that a bearer is
sent, not which credential. The example is the `Bearer <token:<id>>` fixture
shorthand `jwt-session-resolver.adapter.ts` accepts, naming the viewer the
provider states seed, so requests replay as-is.

This replaces the obvious alternative, a Pact `requestFilter` that swaps the
header in provider-side. A requestFilter makes pact-js proxy the whole
verification through Express, and that proxy was observed to corrupt the JSON
body of `POST /auth/magic-link/consume` — 401 through the proxy, 200 without it,
while the same request driven straight at the listener answered 200 either way.
Keeping the proxy out removes a failure mode that looks exactly like a provider
bug.
