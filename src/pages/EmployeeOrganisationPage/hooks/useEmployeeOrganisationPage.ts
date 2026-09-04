import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccessJournal } from '@/api/hooks/useAccessJournal'
import { useEmployee } from '@/api/hooks/useEmployee'
import {
  pickManagerEdge,
  pickPeoplePartnerEdge,
  useRelationships,
} from '@/api/hooks/useRelationships'
import { httpStatus } from '@/lib/http'
import type { AccessJournalRow, S1IdentityCard } from '@/types/api'
import { deriveCurrent, type DerivedCurrent } from '../helpers/journalDerived'

export type JournalStatus = 'loading' | 'ready' | 'forbidden' | 'error' | 'notFound'

/** An authoritative current manager / People Partner edge — carries the
 * `relationshipId` the section needs to reassign or hard-delete it. */
export interface CurrentEdge {
  relationshipId: string
  target: { id: string; firstName: string; lastName: string }
}

/**
 * What a section knows about its current manager / People Partner:
 *  - `loading`       — the authoritative relationships read is still in flight.
 *  - `authoritative` — the read succeeded; `edge` is the current edge (with a
 *                      `relationshipId` to act on) or `null` for "nobody".
 *  - `derived`       — the read is unavailable (`403` / `404` / error), so only
 *                      the journal-derived hint is on offer (read-only: no
 *                      `relationshipId`, so no reassign / remove).
 */
export type CurrentEdgeState =
  | { kind: 'loading' }
  | { kind: 'authoritative'; edge: CurrentEdge | null }
  | { kind: 'derived'; derived: DerivedCurrent }

interface EmployeeOrganisationPageState {
  routeId: string
  backToProfile: string
  /** The subject's S1 card if it is readable (cached from the profile nav), else
   * `null` — the screen falls back to showing the raw id. */
  subject: S1IdentityCard | null
  /** `true` when the whole screen should be replaced by a "not found" panel. */
  notFound: boolean
  journalStatus: JournalStatus
  rows: AccessJournalRow[]
  managerState: CurrentEdgeState
  peoplePartnerState: CurrentEdgeState
  refetchJournal: () => void
  /** Starts `true`; flips to `false` for the rest of the visit on the first
   * `403` from any write (same attempt-and-handle pattern as the profile edit
   * gate). */
  canWrite: boolean
  reportWriteForbidden: () => void
}

const toEdge = (
  view: {
    relationshipId: string
    target: { id: string; firstName: string; lastName: string }
  } | null
): CurrentEdge | null =>
  view ? { relationshipId: view.relationshipId, target: view.target } : null

export const useEmployeeOrganisationPage = (): EmployeeOrganisationPageState => {
  const { id = '' } = useParams<{ id: string }>()
  const journal = useAccessJournal(id)
  const relationships = useRelationships(id)
  const subjectQuery = useEmployee(id)
  const [canWrite, setCanWrite] = useState(true)

  const status = httpStatus(journal.error)
  const rows = Array.isArray(journal.data?.data) ? journal.data.data : []
  const malformed = journal.isSuccess && !Array.isArray(journal.data?.data)

  let journalStatus: JournalStatus
  if (id === '') {
    journalStatus = 'notFound'
  } else if (journal.isError) {
    if (status === 403) {
      journalStatus = 'forbidden'
    } else if (status === 404) {
      journalStatus = 'notFound'
    } else {
      journalStatus = 'error'
    }
  } else if (journal.isLoading) {
    journalStatus = 'loading'
  } else if (malformed) {
    journalStatus = 'error'
  } else {
    journalStatus = 'ready'
  }

  // The authoritative relationships read is the primary source. It is only
  // "authoritative" when it actually returned an array; a `403` / `404` / error
  // (or a malformed body) drops the sections back to the journal-derived hint.
  const relationshipsAuthoritative =
    relationships.isSuccess && Array.isArray(relationships.data?.data)
  const relationshipsLoading = id !== '' && relationships.isLoading

  const sectionState = (kind: 'manager' | 'people_partner'): CurrentEdgeState => {
    if (relationshipsLoading) {
      return { kind: 'loading' }
    }
    if (relationshipsAuthoritative) {
      const view =
        kind === 'manager'
          ? pickManagerEdge(relationships.data?.data)
          : pickPeoplePartnerEdge(relationships.data?.data)
      return { kind: 'authoritative', edge: toEdge(view) }
    }
    return { kind: 'derived', derived: deriveCurrent(rows, kind, journalStatus) }
  }

  const reportWriteForbidden = useCallback(() => setCanWrite(false), [])

  return {
    routeId: id,
    backToProfile: `/employees/${id}`,
    subject: subjectQuery.data?.data ?? null,
    notFound: journalStatus === 'notFound',
    journalStatus,
    rows,
    managerState: sectionState('manager'),
    peoplePartnerState: sectionState('people_partner'),
    refetchJournal: () => {
      void journal.refetch()
    },
    canWrite,
    reportWriteForbidden,
  }
}
