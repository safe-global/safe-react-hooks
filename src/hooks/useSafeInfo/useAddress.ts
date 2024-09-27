import { type UseQueryResult } from '@tanstack/react-query'
import type { Address } from 'viem'
import { usePublicClientQuery } from '@/hooks/usePublicClientQuery.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { QueryKey } from '@/constants.js'

export type UseAddressParams = ConfigParam<SafeConfig>
export type UseAddressReturnType = UseQueryResult<Address>

/**
 * Hook to get the connected Safe's address.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Query result object containing the Safe's address.
 */
export function useAddress(params: UseAddressParams = {}): UseAddressReturnType {
  return usePublicClientQuery({
    ...params,
    querySafeClientFn: (safeClient) =>
      safeClient.protocolKit.getAddress().then((address) => address as Address),
    queryKey: [QueryKey.Address]
  })
}
