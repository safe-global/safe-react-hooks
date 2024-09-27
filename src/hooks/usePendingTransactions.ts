import { type UseQueryResult } from '@tanstack/react-query'
import { useIsDeployed } from '@/hooks/useSafeInfo/useIsDeployed.js'
import { usePublicClientQuery } from '@/hooks/usePublicClientQuery.js'
import type { ConfigParam, SafeConfig, SafeMultisigTransaction } from '@/types/index.js'
import { QueryKey } from '@/constants.js'

export type UsePendingTransactionsParams = ConfigParam<SafeConfig>
export type UsePendingTransactionsReturnType = UseQueryResult<SafeMultisigTransaction[]>

/**
 * Hook to get all pending transactions for the connected Safe.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Query result object containing the list of pending transactions.
 */
export function usePendingTransactions(
  params: UsePendingTransactionsParams = {}
): UsePendingTransactionsReturnType {
  const { data: isDeployed } = useIsDeployed({ config: params.config })

  return usePublicClientQuery({
    ...params,
    querySafeClientFn: async (safeClient) => {
      if (!isDeployed) {
        throw new Error('Safe is not deployed')
      }

      const { results } = await safeClient.getPendingTransactions()
      return results
    },
    queryKey: [QueryKey.PendingTransactions]
  })
}
