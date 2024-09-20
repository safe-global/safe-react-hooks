import { useCallback } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useConfig } from '@/hooks/useConfig.js'
import { usePublicClient } from '@/hooks/usePublicClient.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'

export type UsePublicClientQueryParams<T> = ConfigParam<SafeConfig> & {
  querySafeClientFn: (safeClient: SafeClient) => Promise<T> | T
  queryKey: string[]
}
export type UsePublicClientQueryReturnType<T> = UseQueryResult<T>

/**
 * Hook for sending a custom query via the SafeClient.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @param params.querySafeClientFn Function to query the SafeClient.
 * @param params.queryKey Key to identify the query.
 * @returns Object containing the query result.
 */
export function usePublicClientQuery<T>(
  params: UsePublicClientQueryParams<T>
): UsePublicClientQueryReturnType<T> {
  const { querySafeClientFn, queryKey } = params

  const [config] = useConfig({ config: params.config })
  const safeClient = usePublicClient({ config: params.config })

  const queryFn = useCallback(async () => {
    if (!safeClient) {
      throw new Error('SafeClient not initialized')
    }

    const result = await querySafeClientFn(safeClient)
    console.log('Fetched data:', result)
    return result
  }, [safeClient, querySafeClientFn])

  return useQuery({ queryKey: [...queryKey, config], queryFn })
}
