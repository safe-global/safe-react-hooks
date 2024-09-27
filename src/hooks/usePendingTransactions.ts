import { useCallback } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useConfig } from '@/hooks/useConfig.js'
import { usePublicClient } from '@/hooks/usePublicClient.js'
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
  const [config] = useConfig({ config: params.config })
  const safeClient = usePublicClient({ config: params.config })

  const getPendingTransactions = useCallback(async () => {
    if (!safeClient) {
      throw new Error('SafeClient not initialized')
    }

    const response = await safeClient.getPendingTransactions()
    return response.results
  }, [safeClient])

  return useQuery({
    queryKey: [QueryKey.PendingTransactions, config],
    queryFn: getPendingTransactions
  })
}
