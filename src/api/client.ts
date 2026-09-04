/**
 * Axios HTTP client
 */

import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { clearSession, readSession } from '@/lib/session'

const LOGIN_PATH = '/login'

// Unauthenticated magic-link endpoints: a 401 here is a domain outcome the
// calling page renders itself, never a session-expiry redirect.
const AUTH_ENDPOINT_SUFFIXES = ['/auth/magic-link', '/auth/magic-link/consume']

const isAuthEndpoint = (url: string): boolean => {
  const path = url.split('?')[0].replace(/\/+$/, '')
  return AUTH_ENDPOINT_SUFFIXES.some(suffix => path.endsWith(suffix))
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: env.api.baseUrl,
      timeout: env.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Attach the magic-link session token to every outgoing request.
    this.client.interceptors.request.use(
      config => {
        const token = readSession()
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`)
        }
        return config
      },
      error => Promise.reject(error)
    )

    // A 401 while we hold a session means that session is gone/expired: clear it
    // and hard-redirect to /login exactly once. The unauthenticated magic-link
    // endpoints are excluded — a 401 there is a domain outcome the calling page
    // renders itself (DEC-UM-004).
    this.client.interceptors.response.use(
      response => response,
      error => {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined
        const requestUrl = axios.isAxiosError(error) ? (error.config?.url ?? '') : ''
        if (
          status === 401 &&
          !isAuthEndpoint(requestUrl) &&
          readSession() &&
          typeof window !== 'undefined' &&
          window.location.pathname !== LOGIN_PATH
        ) {
          clearSession()
          window.location.assign(LOGIN_PATH)
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Generic GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  /**
   * Generic PATCH request
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  /**
   * Raw axios instance for advanced usage
   */
  get raw(): AxiosInstance {
    return this.client
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
