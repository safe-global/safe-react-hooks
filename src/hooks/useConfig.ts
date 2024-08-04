import { useContext } from 'react'
import { SafeContext } from '@/SafeProvider.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'

export type UseConfigParams<Config extends SafeConfig = SafeConfig> = ConfigParam<Config>

/**
 * Hook to get the SafeConfig object provided by the nearest `SafeProvider`.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns SafeConfig object provided by `SafeProvider` or the one passed as a parameter.
 */
export function useConfig<Config extends SafeConfig = SafeConfig>(
  params: UseConfigParams<Config> = {}
): Config | SafeConfig {
  const config = params.config ?? useContext(SafeContext)

  if (!config) {
    throw new Error('`useConfig` must be used within `SafeProvider`.')
  }

  return config
}
