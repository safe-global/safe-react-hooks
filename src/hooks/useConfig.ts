import { useContext } from 'react'
import { SafeContext } from '@/SafeProvider.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { MissingSafeProviderError } from '@/errors/MissingSafeProviderError.js'

export type UseConfigParams<Config extends SafeConfig = SafeConfig> = ConfigParam<Config>
export type UseConfigReturnType<Config extends SafeConfig = SafeConfig> = [
  config: Config,
  setConfig: (config: SafeConfig) => void
]

export function useConfig(): UseConfigReturnType
export function useConfig<Config extends SafeConfig>(
  params: UseConfigParams<Config>
): UseConfigReturnType<Config>

/**
 * Hook to get the SafeConfig object provided by the nearest `SafeProvider`.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns SafeConfig object provided by `SafeProvider` or the one passed as a parameter.
 */
export function useConfig(params?: UseConfigParams): UseConfigReturnType {
  const { config: contextConfig, setConfig } = useContext(SafeContext)

  if (params?.config) {
    return [params.config, setConfig]
  }

  if (!contextConfig) {
    throw new MissingSafeProviderError('`useConfig` must be used within `SafeProvider`.')
  }

  return [contextConfig, setConfig]
}
