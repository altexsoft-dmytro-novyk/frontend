import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccessJournal } from '@/api/hooks/useAccessJournal'
import { useEmployee } from '@/api/hooks/useEmployee'
import { httpStatus } from '@/lib/http'
import type { AccessJournalRow, S1IdentityCard } from '@/types/api'
import { deriveCurrent, type DerivedCurrent } from '../helpers/journalDerived'

export type JournalStatus = 'loading' | 'ready' | 'forbidden' | 'error' | 'notFound'

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
  derivedManager: DerivedCurrent
  derivedPeoplePartner: DerivedCurrent
  refetchJournal: () => void
  /** Starts `true`; flips to `false` for the rest of the visit on the first
   * `403` from any write (same attempt-and-handle pattern as the profile edit
   * gate). */
  canWrite: boolean
  reportWriteForbidden: () => void
}

export const useEmployeeOrganisationPage = (): EmployeeOrganisationPageState => {
  const { id = '' } = useParams<{ id: string }>()
  const journal = useAccessJournal(id)
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

  const reportWriteForbidden = useCallback(() => setCanWrite(false), [])

  return {
    routeId: id,
    backToProfile: `/employees/${id}`,
    subject: subjectQuery.data?.data ?? null,
    notFound: journalStatus === 'notFound',
    journalStatus,
    rows,
    derivedManager: deriveCurrent(rows, 'manager', journalStatus),
    derivedPeoplePartner: deriveCurrent(rows, 'people_partner', journalStatus),
    refetchJournal: () => {
      void journal.refetch()
    },
    canWrite,
    reportWriteForbidden,
  }
}
