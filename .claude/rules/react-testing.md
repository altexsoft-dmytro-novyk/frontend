---
paths:
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
  - "vitest.config.ts"
  - "src/test/**"
---

# Unit and Component Testing (U-12)

## File location

- Co-locate the test next to the file it covers: `useDebounce.ts` →
  `useDebounce.test.ts`, `BrandMark.tsx` → `BrandMark.test.tsx`. No mirrored
  `test/` tree — this matches the existing one-folder-per-component layout.
- `*.test.ts` for hooks, helpers and other non-JSX units. `*.test.tsx` for
  anything that renders a component.

## Config and libraries

- Run with `npm run test:unit` (`vitest run`, the default `vitest.config.ts`
  at the service root) or `npm run test:unit:watch`. This config is separate
  from `vitest.contract.config.ts` (Pact) and `playwright.config.ts` (e2e) —
  each command collects only its own files.
- Component tests use `@testing-library/react` (`render`, `screen`,
  `renderHook`) and `@testing-library/user-event` for interaction; assertions
  use `@testing-library/jest-dom` matchers (`toBeInTheDocument`, etc.),
  auto-registered via `src/test/setup.ts`.
- `src/test/setup.ts` also initializes real i18next (same module `main.tsx`
  imports), so components using `useTranslation()` render real copy — don't
  mock `react-i18next`.
- No `test.globals: true`: import `describe`/`it`/`expect`/`vi` from
  `vitest` explicitly, matching `vitest.contract.config.ts`. RTL's DOM
  cleanup is wired explicitly in the setup file for the same reason —
  don't add a second `afterEach(cleanup)` in individual test files.

## Scope

- `components/ui/**` is shadcn-vendored — no unit tests there (shared
  convention, also stated in the platform test-design docs).
- Prefer testing the custom hook (business logic) directly with
  `renderHook`; keep the component test to what the user actually sees.
