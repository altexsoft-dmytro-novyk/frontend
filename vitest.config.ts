import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Unit and component suite only (U-12). Kept separate from
 * `vitest.contract.config.ts` (Pact) and `playwright.config.ts` (e2e) so
 * `npm run test:unit`, `npm run test:contract` and `npm test` never collect
 * each other's files.
 */
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
