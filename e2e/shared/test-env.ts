/**
 * Test environment configuration
 * Uses process.env for Node.js Playwright tests
 */

export const testEnv = {
  api: {
    baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3001',
  },
}
