import { useCallback } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { ListOptions } from '@safe-global/api-kit'
import { useConfig } from '@/hooks/useConfig.js'
import { usePublicClient } from '@/hooks/usePublicClient.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { QueryKey } from '@/constants.js'
import { useAddress } from '@/hooks/useSafeInfo/useAddress.js'
import { ListResponse, SafeOperationResponse } from '@safe-global/types-kit'

export type UseSafeOperationsParams = ConfigParam<SafeConfig> & ListOptions & { ordering?: string }
export type UseSafeOperationsReturnType = UseQueryResult<ListResponse<SafeOperationResponse>>

/**s
 * Hook to get all Safe Operations for the connected Safe.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Query result object containing the list of Safe Operations.
 */
export function useSafeOperations(
  params: UseSafeOperationsParams = {}
): UseSafeOperationsReturnType {
  const [config] = useConfig({ config: params.config })
  const { data: address } = useAddress({ config })
  const safeClient = usePublicClient({ config })

  const getSafeOperations = useCallback(async () => {
    if (!safeClient || !address) {
      throw new Error('SafeClient not initialized')
    }

    const response = await safeClient.apiKit.getSafeOperationsByAddress({
      safeAddress: address,
      limit: params.limit,
      offset: params.offset,
      ordering: params.ordering
    })

    return response
  }, [safeClient, address])

  return useQuery({ queryKey: [QueryKey.SafeOperations, config], queryFn: getSafeOperations })
}
