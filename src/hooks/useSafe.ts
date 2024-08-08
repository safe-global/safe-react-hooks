import { useContext } from 'react'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { useBalance } from '@/hooks/useBalance.js'
import { useChain } from '@/hooks/useChain.js'
import { useSafeInfo } from '@/hooks/useSafeInfo.js'
import { useSignerAddress } from '@/hooks/useSignerAddress.js'
import { useAuthenticate } from '@/hooks/useAuthenticate.js'
import { SafeContext } from '@/SafeProvider.js'

export type UseSafeParams = ConfigParam<SafeConfig>

/**
 * Top-level hook to get Safe-related information.
 * @returns Object wrapping the Safe hooks.
 */
export function useSafe() {
  const { initialized } = useContext(SafeContext)
  const { connect, disconnect } = useAuthenticate()
  return {
    initialized,
    connect,
    disconnect,
    getBalance: useBalance,
    getChain: useChain,
    getSafeInfo: useSafeInfo,
    getSignerAddress: useSignerAddress
  }
}
