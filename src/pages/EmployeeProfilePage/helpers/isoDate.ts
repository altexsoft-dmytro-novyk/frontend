const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * `true` only for a real calendar date in `YYYY-MM-DD` form. A plain
 * `Date.parse` check is not enough — it silently rolls `2026-02-30` over to
 * March, so verify the parsed parts round-trip.
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
