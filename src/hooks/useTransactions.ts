import { useCallback } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useConfig } from '@/hooks/useConfig.js'
import { usePublicClient } from '@/hooks/usePublicClient.js'
import type { ConfigParam, SafeConfig, Transaction } from '@/types/index.js'
import { QueryKey } from '@/constants.js'
import { useAddress } from '@/hooks/useSafeInfo/useAddress.js'

export type UseTransactionsParams = ConfigParam<SafeConfig>
export type UseTransactionsReturnType = UseQueryResult<Transaction[]>

/**
 * Hook to get all executed transactions for the connected Safe.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Query result object containing the list of executed transactions.
 */
export function useTransactions(params: UseTransactionsParams = {}): UseTransactionsReturnType {
  const [config] = useConfig({ config: params.config })
  const { data: address } = useAddress({ config: params.config })
  const safeClient = usePublicClient({ config: params.config })

  const getTransactions = useCallback(async () => {
    if (!safeClient || !address) {
      throw new Error('SafeClient not initialized')
    }

    const response = await safeClient.apiKit.getAllTransactions(address)
    return response.results
  }, [safeClient, address])

  return useQuery({ queryKey: [QueryKey.Transactions, config], queryFn: getTransactions })
}
