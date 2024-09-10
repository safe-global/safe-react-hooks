import { useCallback, useMemo } from 'react'
import { Hash } from 'viem'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'
import { usePublicClient } from '@/hooks/usePublicClient.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'

export type UseSafeTransactionParams = ConfigParam<SafeConfig> & { safeTxHash: Hash }
export type UseSafeTransactionReturnType = UseQueryResult<SafeMultisigTransactionResponse>

/**
 * Hook to get the status of a specific Safe transaction.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @param params.safeTxHash Hash of Safe transaction to be fetched.
 * @returns Query result object containing the transaction object.
 */
export function useSafeTransaction(params: UseSafeTransactionParams): UseSafeTransactionReturnType {
  const safeClient = usePublicClient({ config: params.config })

  const getTransaction = useCallback(async () => {
    if (!safeClient) {
      throw new Error('SafeClient not initialized')
    }
    return safeClient.apiKit.getTransaction(params.safeTxHash)
  }, [safeClient])

  const queryKey = useMemo(() => ['getTransaction', params.safeTxHash], [params.safeTxHash])

  return useQuery({ queryKey, queryFn: getTransaction })
}
