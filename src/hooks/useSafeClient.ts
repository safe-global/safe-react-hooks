import { useEffect, useState } from 'react'
import { createSafeClient, type SafeClient } from '@safe-global/safe-kit'

import type { ConfigParam, SafeConfig } from '../types/index.js'
import { useConfig } from './useConfig.js'

export type UseSafeClientParams<Config extends SafeConfig = SafeConfig> = ConfigParam<Config>

/**
 * Hook to get a SafeClient instance using the SafeConfig object provided by the nearest `SafeProvider`.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns SafeClient instance using the SafeConfig provided by `SafeProvider` or the one passed as a parameter.
 */
export function useSafeClient<Config extends SafeConfig = SafeConfig>(
  params: UseSafeClientParams<Config> = {}
): SafeClient | undefined {
  const config = useConfig({ config: params.config })

  const [safeClient, setSafeClient] = useState<SafeClient>()

  useEffect(() => {
    const initialize = async () => {
      const safeClient = await createSafeClient(config)
      setSafeClient(safeClient)
    }
    initialize()
  }, [config])

  return safeClient
}
