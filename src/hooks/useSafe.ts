import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { useBalance } from '@/hooks/useBalance.js'
import { useChain } from '@/hooks/useChain.js'
import { useSafeInfo } from '@/hooks/useSafeInfo.js'
import { useSignerAddress } from './useSignerAddress.js'

export type UseSafeParams<Config extends SafeConfig = SafeConfig> = ConfigParam<Config>

/**
 * Top-level hook to get Safe-related information.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object wrapping the Safe hooks.
 */
export function useSafe<Config extends SafeConfig = SafeConfig>(
  params: UseSafeParams<Config> = {}
) {
  const { config } = params
  return {
    getBalance: () => useBalance({ config }),
    getChain: () => useChain({ config }),
    getSafeInfo: () => useSafeInfo({ config }),
    getSignerAddress: () => useSignerAddress({ config })
  }
}
