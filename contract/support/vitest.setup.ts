import { beforeEach } from 'vitest'
import { SESSION_TOKEN } from './pact-setup'

/**
 * Every contract case runs as an authenticated caller: the request interceptor
 * only attaches `Authorization` when a session token is present, and a contract
 * recorded without that header would let the provider verify a request the app
 * never actually sends.
 */
beforeEach(() => {
  sessionStorage.setItem('pp.session', SESSION_TOKEN)
})
