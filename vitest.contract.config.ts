import { defineConfig } from 'vitest/config'
import path from 'path'

/**
 * Contract suite only. Kept separate from `playwright.config.ts` so
 * `npm test` (the Playwright e2e gate) and `npm run test:contract` never
 * collect each other's files.
 *
 * jsdom, not node: `src/api/client.ts` reads the session token from
 * `sessionStorage` and its 401 interceptor touches `window.location`. The jsdom
 * URL is `/login` on purpose — that is the one path the interceptor refuses to
 * redirect away from, so a contract case that pins a 401 body cannot trip a
 * "Not implemented: navigation" teardown.
 */
export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    include: ['contract/**/*.pact.spec.ts'],
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost/login' } },
    setupFiles: ['./contract/support/vitest.setup.ts'],
    // Pact spins a mock server per file; parallel files would race on ports.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
})
