const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * `true` only for a real calendar date in `YYYY-MM-DD` form. `Date.parse` alone
 * silently rolls `2026-02-30` into March, so the parsed parts are round-tripped.
 */
export const isRealIsoDate = (value: string): boolean => {
  if (!ISO_DATE_RE.test(value)) {
    return false
  }
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)
  return (
    parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
  )
}

/**
 * `true` unless `value` is a real ISO date strictly before today in the viewer's
 * local time. Deliberately lenient at the boundary: the backend owns the exact
 * "future" rule (it uses `BUSINESS_TIME_ZONE`), so today is allowed through and a
 * server `400` maps to the date field. This only stops an obviously-past submit
 * from ever leaving the browser.
 */
export const isNotPastIsoDate = (value: string): boolean => {
  if (!isRealIsoDate(value)) {
    return false
  }
  const [year, month, day] = value.split('-').map(Number)
  const candidate = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return candidate.getTime() >= today.getTime()
}
