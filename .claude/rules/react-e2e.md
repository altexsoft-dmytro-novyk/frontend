---
paths:
  - "e2e/**"
  - "playwright.config.ts"
---

# E2E Testing Conventions (Playwright)

## Structure

```
e2e/
  app.spec.ts               # App-level smoke tests
  flows/                    # One folder per user flow
    some-feature/
      some-feature.spec.ts  # Tests — use helpers, never raw page.route() inline
      fixtures.ts           # Test DATA (mock responses, configs)
      helpers.ts            # Mock setup FUNCTIONS (page.route() logic)
  shared/                   # Cross-flow utilities
    test-env.ts             # Mirrors src/config/env.ts for Node.js tests
```

- Separate data from functions: fixtures = data, helpers = functions
- Network mocks live in helpers, composed for common scenarios (`setupAppWithData(page)`), never duplicated inline per test
- Flow-specific helpers stay in the flow folder; cross-flow helpers go to `shared/`

## Test style

- Locator priority: `getByRole` > `getByLabel` > `getByTestId` > CSS selectors (avoid)
- Web-first assertions (`await expect(locator).toBeVisible()`), never `waitForTimeout`
- Descriptive test names stating behavior; one focused scenario per test
- Write e2e for critical user journeys and multi-step workflows — not for every small UI change

## Commands (from ``)

- `npm run test` — headless; `npm run test -- some-feature` — one flow
- `npm run test:headed` / `npm run test:ui` — debugging
- Config: `playwright.config.ts` (port 4200, chromium, starts Vite itself)
