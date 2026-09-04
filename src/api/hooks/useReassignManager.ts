import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignManagerApiCall, deleteRelationshipApiCall } from '@/api/organisation'

export interface ReassignManagerVars {
  /** The `relationshipId` of the `direct` edge being replaced. */
  currentRelationshipId: string
  /** The new manager the employee should report to. */
  newTargetId: string
}

/** Which leg of the delete-then-assign sequence failed. `'assign'` means the
 * previous manager is already gone — the employee is momentarily manager-less. */
export type ReassignManagerStage = 'delete' | 'assign'

/** Wraps the underlying axios failure so the section can tell the two failure
 * windows apart (and map `409` on the assign leg to the recovery copy rather
 * than "already has a manager"). Inspect `originalError` for the HTTP status. */
export class ReassignManagerError extends Error {
  constructor(
    readonly stage: ReassignManagerStage,
    readonly originalError: unknown
  ) {
    super(`reassign-manager failed at the ${stage} step`)
    this.name = 'ReassignManagerError'
  }
}

/**
 * DEC-UM-005: manager reassignment is an explicit `DELETE` of the current
 * `direct` edge followed by a `POST` of the new one (the backend `POST` returns
 * `409` while a `direct` edge still exists).
 *
 * The delete-succeeded flag is remembered across calls so a retry after a
 * partial failure (`DELETE` ok, `POST` failed) re-attempts only the `POST`.
 * Call `reset()` when abandoning the flow.
 */
export const useReassignManager = (id: string) => {
  const queryClient = useQueryClient()
  const deleteDoneRef = useRef(false)

  const mutation = useMutation<void, ReassignManagerError, ReassignManagerVars>({
    mutationFn: async ({ currentRelationshipId, newTargetId }) => {
      if (!deleteDoneRef.current) {
        try {
          await deleteRelationshipApiCall(id, currentRelationshipId)
        } catch (caught) {
          throw new ReassignManagerError('delete', caught)
        }
        deleteDoneRef.current = true
      }
      try {
        await assignManagerApiCall(id, newTargetId)
      } catch (caught) {
        throw new ReassignManagerError('assign', caught)
      }
      deleteDoneRef.current = false
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'relationships'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', id, 'access-journal'] })
      void queryClient.invalidateQueries({ queryKey: ['employee', id], exact: true })
    },
  })

  const reset = () => {
    deleteDoneRef.current = false
    mutation.reset()
  }

  /** `true` once the previous manager has been removed but the new assignment
   * has not yet landed — the section shows the recovery copy and a retry that
   * re-`POST`s only. */
  const previousManagerRemoved =
    mutation.error instanceof ReassignManagerError && mutation.error.stage === 'assign'

  return { ...mutation, previousManagerRemoved, reset }
}
