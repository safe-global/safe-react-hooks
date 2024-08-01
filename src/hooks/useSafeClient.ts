import { useCallback, useEffect, useState } from 'react'
import { createSafeClient, type SafeClient } from '@safe-global/safe-kit'

import type { ConfigParam, SafeConfig } from '../types/index.js'
import { useConfig } from './useConfig.js'

export type UseSafeClientParams<Config extends SafeConfig = SafeConfig> = ConfigParam<Config>
export type UseSafeClientReturnType = {
  safeClient: SafeClient | undefined
  getSafeClient: () => Promise<SafeClient>
}

/**
 * Hook to get a SafeClient instance using the SafeConfig object provided by the nearest `SafeProvider`.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object containing a SafeClient instance and a function that resolves with it.
 */
export function useSafeClient<Config extends SafeConfig = SafeConfig>(
  params: UseSafeClientParams<Config> = {}
): UseSafeClientReturnType {
  const config = useConfig({ config: params.config })

  const [safeClient, setSafeClient] = useState<SafeClient>()

  const getSafeClient = useCallback((): Promise<SafeClient> => {
    if (safeClient) {
      return Promise.resolve(safeClient)
    }
    return createSafeClient(config)
  }, [config])

  useEffect(() => {
    createSafeClient(config).then(setSafeClient)
  }, [config])

  return { safeClient, getSafeClient }
}
