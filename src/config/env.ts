/**
 * Type-safe environment configuration
 */

interface EnvironmentConfig {
  api: {
    baseUrl: string
    timeout: number
  }
}

function getEnvVarWithDefault(name: string, defaultValue: string): string {
  return import.meta.env[name] || defaultValue
}

export const env: EnvironmentConfig = {
  api: {
    baseUrl: getEnvVarWithDefault('VITE_API_BASE_URL', 'http://localhost:3001'),
    timeout: parseInt(getEnvVarWithDefault('VITE_API_TIMEOUT', '30000'), 10),
  },
}
