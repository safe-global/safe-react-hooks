import { type UseQueryResult } from '@tanstack/react-query'
import { usePublicClientQuery } from '@/hooks/usePublicClientQuery.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { QueryKey } from '@/constants.js'

export type UseThresholdParams = ConfigParam<SafeConfig>
export type UseThresholdReturnType = UseQueryResult<number>

/**
 * Hook to get the connected Safe's threshold.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Query result object containing the Safe's threshold.
 */
export function useThreshold(params: UseThresholdParams = {}): UseThresholdReturnType {
  return usePublicClientQuery({
    ...params,
    querySafeClientFn: (safeClient) => safeClient.getThreshold(),
    queryKey: [QueryKey.Threshold]
  })
}
