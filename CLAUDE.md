# People Management Frontend

Grown from a clean React starter into the people-management UI. Detailed per-area conventions live in `.claude/rules/` and load automatically when working with matching files.

## Tech Stack

- **Build**: Vite 8
- **Framework**: React 19 + TypeScript 5.7
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix UI), Lucide icons
- **Routing**: React Router v7
- **Data Fetching**: TanStack Query + Axios
- **i18n**: i18next / react-i18next (English only)
- **Forms**: react-hook-form + zod via `@hookform/resolvers`
- **Auth**: magic link; bearer token held in `sessionStorage`
- **Testing**: Playwright (e2e) + Vitest/React Testing Library (unit + component) + Pact consumer contracts on Vitest
- **Quality**: ESLint + Prettier

## Commands

- `npm run dev` — dev server with HMR (port 4200)
- `npm run build` — typecheck + production build
- `npm run typecheck` — type check without emit
- `npm run lint` / `npm run lint:fix` — ESLint
- `npm run format` / `npm run format:check` — Prettier
- `npm run test` — Playwright e2e (starts Vite itself)
- `npm run test:unit` — unit + component tests (Vitest, jsdom, React Testing Library)
- `npm run test:unit:watch` — same, in watch mode
- `npm run test:contract` — Pact consumer contracts (Vitest, jsdom); writes `pacts/`

## Project Structure (`src/`)

- `api/` — axios client singleton (`client.ts`); TanStack Query hooks go in `api/hooks/`
- `components/` — shared components, one folder per component (AppLayout, MainLayout, MainHeader, SideMenu, BrandMark, PersonPicker, RequireAuth, StatePanel); `components/ui/` is shadcn-CLI-managed
- `config/env.ts` — type-safe env access; all env vars must be `VITE_`-prefixed
- `contexts/` — React contexts (LayoutContext)
- `hooks/` — global reusable hooks
- `i18n/` + `locales/` — i18next config and translation files
- `lib/` — shadcn technical utils (`cn()`); no business logic here, use `helpers/`
- `pages/` — one folder per page with its own `hooks/` and `components/`
- `router/` — route configuration (`index.tsx`)
- `types/` + `@types/` — shared domain types and ambient declarations

E2E tests live in `e2e/` (flows + shared utilities). Pact consumer specs live in
`contract/` (`*.pact.spec.ts`), configured by `vitest.contract.config.ts` — kept
separate so `npm test` and `npm run test:contract` never collect each other's files.
Unit and component specs are co-located next to the file they cover as
`*.test.ts` / `*.test.tsx` (e.g. `hooks/useDebounce.test.ts`,
`components/BrandMark/BrandMark.test.tsx`), configured by the default
`vitest.config.ts` and run via `npm run test:unit` — see
`.claude/rules/react-testing.md`.

## Code Style (universal)

- TypeScript strict: no `any` — use `unknown` for truly unknown types; prefer `interface` for object shapes
- Arrow functions for all React components, never `function` declarations
- Imports via the `@/` alias, never long relative paths (`../../../`)
- Keep components under 200 lines — split if larger
- Never hardcode user-facing text — always use i18n translation keys
- All code comments in English
- Don't create empty folders
- Forms: `react-hook-form` + `zod` through `@hookform/resolvers` — they are installed; do not hand-roll validation or add a second form library

## Environment

- `.env` is gitignored; `.env.example` is the committed template. Defaults in `config/env.ts` work without a `.env` file
- Backend is expected at `http://localhost:3001` (`VITE_API_BASE_URL`)

## Gotchas

- tsconfig `paths` works without `baseUrl` (deprecated in TS 6+) — don't re-add `baseUrl`
- Auth is live, not a stub: the request interceptor in `src/api/client.ts` attaches
  `Authorization: Bearer <token>` from the session, and the response interceptor clears the
  session and hard-redirects to `/login` on a 401 — except on the unauthenticated magic-link
  endpoints, where a 401 is a domain outcome the calling page renders itself (DEC-UM-004)
