import { type UseQueryResult } from '@tanstack/react-query'
import { ListOptions } from '@safe-global/api-kit'
import { useConfig } from '@/hooks/useConfig.js'
import { useIsDeployed } from '@/hooks/useSafeInfo/useIsDeployed.js'
import { usePublicClientQuery } from '@/hooks/usePublicClientQuery.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { QueryKey } from '@/constants.js'
import { ListResponse, SafeOperationResponse } from '@safe-global/types-kit'
import { safeOperations } from '@safe-global/sdk-starter-kit'

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
  const [config] = useConfig({ config: params.config })
  const { data: isDeployed } = useIsDeployed({ config })

  return usePublicClientQuery({
    ...params,
    querySafeClientFn: async (safeClient) => {
      if (!isDeployed) {
        throw new Error('Safe is not deployed')
      }

      if (!config?.safeOperationOptions)
        throw new Error('SafeOperationOptions are not specified in SafeConfig')

      const { bundlerUrl, ...paymasterOptions } = config.safeOperationOptions
      const safeOperationsClient = await safeClient.extend(
        safeOperations({ bundlerUrl }, paymasterOptions)
      )

      const pendingSafeOperations = await safeOperationsClient.getPendingSafeOperations({
        limit: params.limit,
        offset: params.offset
      })

      return pendingSafeOperations
    },
    queryKey: [QueryKey.PendingSafeOperations]
  })
}
