import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import '@/i18n/config'

// No `test.globals: true` in vitest.config.ts, so RTL's own auto-cleanup
// (which only registers when `afterEach` is a global) never fires — wire it
// explicitly or DOM from one test leaks into the next within a file.
afterEach(() => {
  cleanup()
})
