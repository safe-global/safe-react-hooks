import { useEffect, useState } from 'react'
import { createSafeClient, type SafeClient } from '@safe-global/safe-kit'
import { useConfig } from '@/hooks/useConfig.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'

export type UseSafeClientParams<Config extends SafeConfig = SafeConfig> = ConfigParam<Config>
export type UseSafeClientReturnType = SafeClient | undefined

/**
 * Hook to get a SafeClient instance using the SafeConfig object provided by the nearest `SafeProvider`.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns SafeClient instance or `undefined` if the SafeClient is not initialized yet.
 */
export function useSafeClient<Config extends SafeConfig = SafeConfig>(
  params: UseSafeClientParams<Config> = {}
): UseSafeClientReturnType {
  const config = params.config ? useConfig({ config: params.config }) : useConfig()

  const [safeClient, setSafeClient] = useState<SafeClient>()

  useEffect(() => {
    createSafeClient(config).then(setSafeClient)
  }, [config])

  return safeClient
}
