import { useCallback } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Address } from 'viem'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { useConfig } from '@/hooks/useConfig.js'
import { usePublicClient } from '@/hooks/usePublicClient.js'
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
  const [config] = useConfig({ config: params.config })
  const safeClient = usePublicClient({ config: params.config })

  const getSafeAddress = useCallback(async (): Promise<Address | undefined> => {
    if (!safeClient) {
      throw new Error('SafeClient not initialized')
    }

    return safeClient.protocolKit.getAddress().then((address) => address as Address)
  }, [safeClient])

  return useQuery({ queryKey: [QueryKey.Address, config], queryFn: getSafeAddress })
}
