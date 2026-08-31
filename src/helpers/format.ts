/** Shared display formatters. */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** "12 April" from day/month numbers, or `null` when either is missing. */
export function formatBirthday(day: number | null, month: number | null): string | null {
  if (!day || !month || month < 1 || month > 12) return null
  return `${day} ${MONTHS[month - 1]}`
}

/** ISO date → "12 Apr 2021" (locale-independent, no time). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Whole years between `iso` and now (>= 0). */
export function yearsSince(iso: string | null | undefined): number {
  if (!iso) return 0
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return 0
  const ms = Date.now() - then.getTime()
  return Math.max(0, Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000)))
}

export function fullName(first: string, last: string): string {
  return `${first} ${last}`.trim()
}
