import { useContext } from 'react'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { useBalance } from '@/hooks/useBalance.js'
import { useChain } from '@/hooks/useChain.js'
import { useSafeInfo } from '@/hooks/useSafeInfo.js'
import { SafeContext } from '@/SafeProvider.js'

export type UseSafeParams = ConfigParam<SafeConfig>

/**
 * Top-level hook to get Safe-related information.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object wrapping the Safe hooks.
 */
  const { initialized } = useContext(SafeContext)
  return {
    initialized,
    getBalance: () => useBalance({ config }),
    getChain: () => useChain({ config }),
    getSafeInfo: () => useSafeInfo({ config }),
    getSignerAddress: () => useSignerAddress({ config })
  }
}
