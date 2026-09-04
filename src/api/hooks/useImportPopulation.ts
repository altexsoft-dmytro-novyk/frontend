import { useMutation, useQueryClient } from '@tanstack/react-query'
import { importPopulationApiCall } from '@/api/import'
import type { ImportSummary } from '@/types/api'

/**
 * `POST /users/import` — the seeded-population CSV import. On any `200` both the
 * `['employees']` directory prefix and the `['employee']` profile-detail prefix
 * are invalidated: created rows change the roster, and `updated` rows (matched
 * by work email) leave individual profile cards stale. The summary itself drives
 * the on-screen result.
 */
export const useImportPopulation = () => {
  const queryClient = useQueryClient()

  return useMutation<ImportSummary, unknown, File>({
    mutationFn: (file: File) => importPopulationApiCall(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: ['employee'] })
    },
  })
}
