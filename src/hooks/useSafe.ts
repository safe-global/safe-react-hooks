import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { useBalance } from '@/hooks/useBalance.js'
import { useChain } from '@/hooks/useChain.js'
import { useSafeInfo } from '@/hooks/useSafeInfo.js'

export type UseSafeParams<Config extends SafeConfig = SafeConfig> = ConfigParam<Config>

export function useSafe<Config extends SafeConfig = SafeConfig>(
  params: UseSafeParams<Config> = {}
) {
  const { config } = params
  return {
    getBalance: () => useBalance({ config }),
    getChain: () => useChain({ config }),
    getSafeInfo: () => useSafeInfo({ config })
  }
}
