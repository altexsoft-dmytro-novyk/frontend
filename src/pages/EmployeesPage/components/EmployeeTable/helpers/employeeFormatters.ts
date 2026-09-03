import type { EmployeeListItem } from '@/types/api'

const DASH = '—'
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Up-to-two-letter initials for the avatar fallback. */
export const getInitials = (firstName: string, lastName: string): string => {
  const first = firstName.trim().charAt(0)
  const last = lastName.trim().charAt(0)
  return `${first}${last}`.toUpperCase() || DASH
}

/**
 * Birthday as day + short month (`D MMM`, no year — the backend never sends one).
 * Returns the em dash when either part is missing or out of range.
 */
export const formatBirthday = (day: number | null, month: number | null): string => {
  if (
    day === null ||
    month === null ||
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    return DASH
  }
  const monthName = new Intl.DateTimeFormat(undefined, { month: 'short' }).format(
    new Date(2000, month - 1, 1)
  )
  return `${day} ${monthName}`
}

/** `YYYY-MM-DD` (date-only, no timezone) rendered in the viewer's locale. */
export const formatJoinDate = (isoDate: string): string => {
  if (!ISO_DATE.test(isoDate)) {
    return isoDate
  }
  const [year, month, day] = isoDate.split('-').map(Number)
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return isoDate
  }
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export const fullName = (employee: Pick<EmployeeListItem, 'firstName' | 'lastName'>): string =>
  `${employee.firstName} ${employee.lastName}`.trim()

export { DASH }
