/**
 * Shared date/time formatting. `formatIsoDate` (date-only, locale) lives in
 * `employeeFormatters.ts`; this is the timestamp companion.
 */

/**
 * An ISO-8601 timestamp rendered as date + time. When `timeZone` is given the
 * value is shown in that IANA zone (e.g. a departure `dueAt` shown next to its
 * explicit "Time zone" field); otherwise the viewer's local zone. An invalid
 * timestamp or zone falls back gracefully.
 */
export const formatTimestamp = (iso: string, timeZone?: string): string => {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return iso
  }
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  try {
    return new Intl.DateTimeFormat(undefined, timeZone ? { ...options, timeZone } : options).format(
      parsed
    )
  } catch {
    // An unrecognised IANA zone — fall back to the viewer's local zone.
    return new Intl.DateTimeFormat(undefined, options).format(parsed)
  }
}

/** Today's date as a local `YYYY-MM-DD` string — for a date input's `min`. */
export const todayIsoDate = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
