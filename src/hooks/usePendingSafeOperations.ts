import { type UseQueryResult } from '@tanstack/react-query'
import { ListOptions } from '@safe-global/api-kit'
import { usePublicClientQuery } from '@/hooks/usePublicClientQuery.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { QueryKey } from '@/constants.js'
import { ListResponse, SafeOperationResponse } from '@safe-global/types-kit'

export type UsePendingSafeOperationsParams = ConfigParam<SafeConfig> & ListOptions
export type UsePendingSafeOperationsReturnType = UseQueryResult<ListResponse<SafeOperationResponse>>

/**
 * Hook to get all pending Safe Operations for the connected Safe.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Query result object containing the list of pending Safe Operations.
 */
export function usePendingSafeOperations(
  params: UsePendingSafeOperationsParams = {}
): UsePendingSafeOperationsReturnType {
  return usePublicClientQuery({
    ...params,
    querySafeClientFn: async (safeClient) => {
      if (!safeClient.getPendingSafeOperations)
        throw new Error(
          'To use Safe Operations, you need to specify the safeOperationOptions in the SafeProvider configuration.'
        )

      const pendingSafeOperations = await safeClient.getPendingSafeOperations({
        limit: params.limit,
        offset: params.offset
      })

      return pendingSafeOperations
    },
    queryKey: [QueryKey.PendingSafeOperations]
  })
}
