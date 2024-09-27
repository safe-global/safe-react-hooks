import { type UseQueryResult } from '@tanstack/react-query'
import { usePublicClientQuery } from '@/hooks/usePublicClientQuery.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { QueryKey } from '@/constants.js'

export type UseIsDeployedParams = ConfigParam<SafeConfig>
export type UseIsDeployedReturnType = UseQueryResult<boolean>

/**
 * Hook to get the connected Safe's deployment state.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Query result object containing a flag whether the connected Safe is deployed.
 */
export function useIsDeployed(params: UseIsDeployedParams = {}): UseIsDeployedReturnType {
  return usePublicClientQuery({
    ...params,
    querySafeClientFn: (safeClient) => safeClient.protocolKit.isSafeDeployed(),
    queryKey: [QueryKey.IsDeployed]
  })
}
