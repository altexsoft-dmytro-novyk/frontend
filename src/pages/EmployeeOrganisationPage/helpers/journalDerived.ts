import type { AccessJournalRow } from '@/types/api'
import type { JournalStatus } from '../hooks/useEmployeeOrganisationPage'

/**
 * The "current" manager / People Partner is shown ONLY as derived from the
 * access journal's own rows — never presented as an authoritative read (the
 * backend exposes no current-state endpoint; see `deferred-work.md`).
 *
 *  - `loading`  — the journal request is still in flight.
 *  - `unknown`  — the journal is not readable (or its newest snapshot can't be
 *                 interpreted), so nothing can be derived.
 *  - `none`     — the journal is readable and the newest matching row is a
 *                 removal (or there is no matching row at all).
 *  - `assigned` — the newest matching row assigns `targetUserId`.
 */
export type DerivedCurrent =
  | { state: 'loading' }
  | { state: 'unknown' }
  | { state: 'none' }
  | { state: 'assigned'; targetUserId: string }

const isSnapshot = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const deriveCurrent = (
  rows: AccessJournalRow[] | undefined,
  kind: 'manager' | 'people_partner',
  journalStatus: JournalStatus
): DerivedCurrent => {
  if (journalStatus === 'loading') {
    return { state: 'loading' }
  }
  if (journalStatus !== 'ready') {
    return { state: 'unknown' }
  }
  // `rows` arrive newest-first from the API.
  const latest = (rows ?? []).find(row => row.kind === kind)
  if (!latest) {
    return { state: 'none' }
  }
  if (latest.after === null || latest.after === undefined) {
    return { state: 'none' }
  }
  if (!isSnapshot(latest.after)) {
    return { state: 'unknown' }
  }
  const target = latest.after.reportsToUserId
  if (typeof target !== 'string' || target.length === 0) {
    // A non-null snapshot we can't interpret — the shape has drifted, so don't
    // claim "none".
    return { state: 'unknown' }
  }
  return { state: 'assigned', targetUserId: target }
}
