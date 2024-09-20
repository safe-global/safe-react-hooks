import type { Address } from 'viem'
import { type UseQueryResult } from '@tanstack/react-query'
import { usePublicClientQuery } from '@/hooks/usePublicClientQuery.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { QueryKey } from '@/constants.js'

export type UseOwnersParams = ConfigParam<SafeConfig>
export type UseOwnersReturnType = UseQueryResult<Address[]>

/**
 * Hook to get the connected Safe's owners.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Query result object containing the connected Safe's owners.
 */
export function useOwners(params: UseOwnersParams = {}): UseOwnersReturnType {
  return usePublicClientQuery({
    ...params,
    querySafeClientFn: (safeClient) =>
      safeClient.protocolKit.getOwners().then((owners) => owners as Address[]),
    queryKey: [QueryKey.Owners]
  })
}
