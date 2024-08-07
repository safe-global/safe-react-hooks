import { useContext } from 'react'
import { SafeContext } from '@/SafeProvider.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'

export type UseConfigParams = ConfigParam<SafeConfig>

export function useConfig(params?: UseConfigParams): SafeConfig
export function useConfig<Params extends UseConfigParams>(params: Params): Params['config']

/**
 * Hook to get the SafeConfig object provided by the nearest `SafeProvider`.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns SafeConfig object provided by `SafeProvider` or the one passed as a parameter.
 */
export function useConfig(params?: UseConfigParams) {
  const contextConfig = useContext(SafeContext)

  if (params?.config) {
    return params.config
  }

  if (!contextConfig) {
    throw new Error('`useConfig` must be used within `SafeProvider`.')
  }

  return contextConfig
}
