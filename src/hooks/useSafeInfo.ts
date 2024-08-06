import { useCallback, useMemo } from 'react'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Address } from 'viem'
import type { ConfigParam, SafeConfig, SafeInfo } from '@/types/index.js'
import { useConfig } from '@/hooks/useConfig.js'
import { useSafeClient } from '@/hooks/useSafeClient.js'

export type UseSafeInfoParams<Config extends SafeConfig = SafeConfig> = ConfigParam<Config>
export type UseSafeInfoReturnType = UseQueryResult<SafeInfo>

export function useSafeInfo<Config extends SafeConfig = SafeConfig>(
  params: UseSafeInfoParams<Config> = {}
): UseSafeInfoReturnType {
  const config = params.config ? useConfig({ config: params.config }) : useConfig()
  const safeClient = useSafeClient(params.config ? { config: params.config } : undefined)

  const getSafeInfo = useCallback(async (): Promise<SafeInfo | undefined> => {
    if (!safeClient) {
      throw new Error('SafeClient not initialized')
    }
    const [address, nonce, threshold, isDeployed, owners] = await Promise.all([
      safeClient.protocolKit.getAddress().then((address) => address as Address),
      safeClient.protocolKit.getNonce(),
      safeClient.protocolKit.getThreshold(),
      safeClient.protocolKit.isSafeDeployed(),
      safeClient.protocolKit.getOwners()
    ])
    return { address, nonce, threshold, isDeployed, owners }
  }, [safeClient])

  const queryKey = useMemo(() => ['safeInfo', config], [config])

  return useQuery({ queryKey, queryFn: getSafeInfo })
}
