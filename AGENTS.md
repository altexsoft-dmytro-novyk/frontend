<!-- bmad:context -->
<!-- Verified 2026-09-08 against 4684eb1. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## frontend (React)

React 19 + Vite 8 UI for people management. Path-scoped conventions in `.claude/rules/`; stack and structure in `CLAUDE.md`.

## Policy

- Commit UI changes here, not in the workspace root.
- Never hardcode user-facing text — use i18n translation keys.
- Never hand-edit `src/components/ui/` — it is shadcn CLI-managed.

## Where things are

- API client and query hooks: `src/api/`; pages: `src/pages/`; routing: `src/router/`
- Pact consumer specs: `contract/*.pact.spec.ts`; the recorded pact is committed under `pacts/`
- Domain specs for active work: workspace `_bmad-output/specs/spec-*/SPEC.md`

## Running and verifying

- `npm run test` starts Vite via Playwright config — do not run `npm run dev` first.
- Backend is expected at `http://localhost:3001` (`VITE_API_BASE_URL`).
- `npm run test:contract` rewrites `pacts/`, and the backend verifies that committed file straight out of this checkout — commit it together with any change to a request shape, or the provider verification breaks there.

## Conventions that differ from defaults

- Use arrow functions for all React components, never `function` declarations.
- Use the `@/` import alias, never long relative paths.
- Fetch data through TanStack Query hooks in `api/hooks/` — never call `apiClient` directly from a component.

## Known pitfalls

- tsconfig `paths` works without `baseUrl` — do not re-add `baseUrl` (deprecated in TS 6+).

<!-- /bmad:context -->
