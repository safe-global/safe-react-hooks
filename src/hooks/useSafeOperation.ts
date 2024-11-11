import { useCallback, useMemo } from 'react'
import { Hash } from 'viem'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useConfig } from '@/hooks/useConfig.js'
import { SafeMultisigTransactionResponse } from '@safe-global/types-kit'
import { usePublicClient } from '@/hooks/usePublicClient.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'

export type UseSafeOperationParams = ConfigParam<SafeConfig> & { safeOperationHash: Hash }
export type UseSafeOperationReturnType = UseQueryResult<SafeMultisigTransactionResponse>

/**
 * Hook to get the status of a specific Safe Operation.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @param params.safeOperationHash Hash of Safe Operation to be fetched.
 * @returns Query result object containing the transaction object.
 */
export function useSafeOperation(params: UseSafeOperationParams): UseSafeOperationReturnType {
  const [config] = useConfig({ config: params.config })

  const safeClient = usePublicClient({ config })

  const getSafeOperation = useCallback(async () => {
    if (!safeClient) {
      throw new Error('SafeClient not initialized')
    }

    return safeClient.apiKit.getSafeOperation(params.safeOperationHash)
  }, [safeClient])

  const queryKey = useMemo(
    () => ['getSafeOperation', params.safeOperationHash],
    [params.safeOperationHash]
  )

  return useQuery({ queryKey, queryFn: getSafeOperation })
}
