const isSnapshot = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** An ISO-8601 timestamp rendered in the viewer's locale (date + time). */
export const formatTimestamp = (iso: string | null | undefined): string => {
  if (!iso) {
    return '—'
  }
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return iso
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

/**
 * A compact one-line summary of a journal before/after snapshot. The
 * `manager` / `people_partner` snapshots are `{ relationshipId, userId, type,
 * reportsToUserId }`; other kinds carry their own shapes. `null` (a create's
 * `before` or a removal's `after`) renders as an em dash.
 */
export const snapshotSummary = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '—'
  }
  if (isSnapshot(value)) {
    if (typeof value.reportsToUserId === 'string') {
      return value.reportsToUserId
    }
    if (typeof value.departmentId === 'string') {
      return value.departmentId
    }
    if (typeof value.managerUserId === 'string') {
      return value.managerUserId
    }
    const entries = Object.entries(value)
    return entries.length === 0
      ? '—'
      : entries
          .map(([key, entryValue]) => {
            const rendered =
              entryValue !== null && typeof entryValue === 'object'
                ? JSON.stringify(entryValue)
                : String(entryValue)
            return `${key}: ${rendered}`
          })
          .join(', ')
  }
  return String(value)
}
