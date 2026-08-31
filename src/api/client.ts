/**
 * Axios HTTP client — single configured instance for the whole app.
 *
 * - Base URL is the versioned API root (`${origin}/api/v1`).
 * - The request interceptor attaches the session bearer token.
 * - A `401` anywhere clears the session and bounces to `/login` (once).
 */

import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { apiRoot, env } from '@/config/env'
import { session } from '@/lib/session'

const AUTH_PATHS = ['/login', '/auth/callback']

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: apiRoot,
      timeout: env.api.timeout,
      headers: { 'Content-Type': 'application/json' },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(config => {
      const token = session.get()
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })

    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 && session.get()) {
          session.clear()
          const onAuthPage = AUTH_PATHS.some(p => window.location.pathname.startsWith(p))
          if (!onAuthPage) {
            const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
            window.location.assign(`/login?returnTo=${returnTo}`)
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.get<T>(url, config)).data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.post<T>(url, data, config)).data
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.patch<T>(url, data, config)).data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.put<T>(url, data, config)).data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.client.delete<T>(url, config)).data
  }

  get raw(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient()

/** HTTP status from a thrown error, or `undefined` for network/other failures. */
export function httpStatus(error: unknown): number | undefined {
  return error instanceof AxiosError ? error.response?.status : undefined
}

/** True when the error is an HTTP response with one of the given status codes. */
export function isHttpStatus(error: unknown, ...codes: number[]): boolean {
  const status = httpStatus(error)
  return status !== undefined && codes.includes(status)
}
