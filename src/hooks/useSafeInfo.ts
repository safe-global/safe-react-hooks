import { useCallback } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Address } from 'viem'
import type { ConfigParam, SafeConfig, SafeInfo } from '@/types/index.js'
import { useSafeClient } from '@/hooks/useSafeClient.js'

export type UseSafeInfoParams<Config extends SafeConfig = SafeConfig> = ConfigParam<Config>
export type UseSafeInfoReturnType = UseQueryResult<SafeInfo>

export function useSafeInfo<Config extends SafeConfig = SafeConfig>(
  params: UseSafeInfoParams<Config> = {}
): UseSafeInfoReturnType {
  const { getSafeClient } = useSafeClient({ config: params.config })

  const getSafeInfo = useCallback(async (): Promise<SafeInfo | undefined> => {
    const safeClient = await getSafeClient()
    const [address, nonce, threshold, isDeployed, owners] = await Promise.all([
      safeClient.protocolKit.getAddress().then((address) => address as Address),
      safeClient.protocolKit.getNonce(),
      safeClient.protocolKit.getThreshold(),
      safeClient.protocolKit.isSafeDeployed(),
      safeClient.protocolKit.getOwners()
    ])
    return { address, nonce, threshold, isDeployed, owners }
  }, [getSafeClient])

  return useQuery({ queryKey: ['safeInfo'], queryFn: getSafeInfo })
}
