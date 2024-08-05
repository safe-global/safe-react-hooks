import { useContext } from 'react'
import { SafeContext } from '@/SafeProvider.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'

type SafeContextConfig = typeof SafeContext extends React.Context<infer T | undefined> ? T : never

export type UseConfigParams<Config extends SafeConfig = SafeConfig> = ConfigParam<Config>

export function useConfig(params?: UseConfigParams): SafeContextConfig
export function useConfig<Params extends UseConfigParams>(params: Params): Params['config']

/**
 * Hook to get the SafeConfig object provided by the nearest `SafeProvider`.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns SafeConfig object provided by `SafeProvider` or the one passed as a parameter.
 */
export function useConfig(params?: UseConfigParams<SafeConfig>) {
  const contextConfig = useContext(SafeContext)

  if (params?.config) {
    return params.config
  }

  if (!contextConfig) {
    throw new Error('`useConfig` must be used within `SafeProvider`.')
  }

  return contextConfig
}
