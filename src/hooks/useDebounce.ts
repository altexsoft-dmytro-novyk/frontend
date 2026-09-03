import { useEffect, useState } from 'react'

/**
 * Returns `value` delayed by `delayMs` — the debounced copy only updates once
 * the input has been stable for that long. Handy for turning per-keystroke
 * state into a settled value that drives a query.
 */
export const useDebounce = <T>(value: T, delayMs = 300): T => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
