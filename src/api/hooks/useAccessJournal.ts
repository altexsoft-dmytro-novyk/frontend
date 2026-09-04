import { useQuery } from '@tanstack/react-query'
import { getAccessJournalApiCall } from '@/api/organisation'
import { httpStatus } from '@/lib/http'

/**
 * `GET /users/:id/access-journal` — the relationship/access change history.
 *
 * A `403` is terminal and expected: the reader gate admits only the subject's
 * current reporting-line manager or assigned People Partner (not self, not
 * HR-Admin by role), so most viewers get it. The section then renders an
 * explanatory panel, never an error — so a `403` must not retry. Only a
 * transport failure or a `5xx` is worth retrying.
 */
export const useAccessJournal = (id: string) => {
  return useQuery({
    queryKey: ['employee', id, 'access-journal'],
    queryFn: () => getAccessJournalApiCall(id),
    enabled: id.length > 0,
    retry: (failureCount, error) => {
      if (failureCount >= 1) {
        return false
      }
      const status = httpStatus(error)
      return status === undefined || status >= 500
    },
  })
}
