/**
 * Type-safe environment configuration
 */

interface EnvironmentConfig {
  api: {
    /** Backend origin, e.g. http://localhost:3001 (no trailing slash, no /api/v1). */
    baseUrl: string
    /** Versioned API prefix the NestJS server mounts (`/api` + URI versioning). */
    prefix: string
    timeout: number
  }
}

function getEnvVarWithDefault(name: string, defaultValue: string): string {
  return import.meta.env[name] || defaultValue
}

const rawBaseUrl = getEnvVarWithDefault('VITE_API_BASE_URL', 'http://localhost:3001')

export const env: EnvironmentConfig = {
  api: {
    baseUrl: rawBaseUrl.replace(/\/+$/, ''),
    prefix: getEnvVarWithDefault('VITE_API_PREFIX', '/api/v1'),
    timeout: parseInt(getEnvVarWithDefault('VITE_API_TIMEOUT', '30000'), 10),
  },
}

/** Fully-qualified API root, e.g. http://localhost:3001/api/v1 */
export const apiRoot = `${env.api.baseUrl}${env.api.prefix}`
