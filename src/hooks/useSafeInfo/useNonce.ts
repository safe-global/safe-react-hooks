import { type UseQueryResult } from '@tanstack/react-query'
import { usePublicClientQuery } from '@/hooks/usePublicClientQuery.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { QueryKey } from '@/constants.js'

export type UseNonceParams = ConfigParam<SafeConfig>
export type UseNonceReturnType = UseQueryResult<number>

/**
 * Hook to get the connected Safe's next nonce value.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Query result object containing the Safe's nonce.
 */
export function useNonce(params: UseNonceParams = {}): UseNonceReturnType {
  return usePublicClientQuery({
    ...params,
    querySafeClientFn: (safeClient) => safeClient.getNonce(),
    queryKey: [QueryKey.Nonce]
  })
}
