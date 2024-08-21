import { useContext } from 'react'
import {
  useAuthenticate,
  useBalance,
  useChain,
  usePendingTransactions,
  useSafeInfo,
  useSignerAddress,
  useTransactions
} from '@/hooks/index.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { MissingSafeProviderError } from '@/errors/MissingSafeProviderError.js'
import { SafeContext } from '@/SafeProvider.js'

export type UseSafeParams = ConfigParam<SafeConfig>

/**
 * Top-level hook to get Safe-related information.
 * @returns Object wrapping the Safe hooks.
 */
export function useSafe() {
  const { isInitialized, config } = useContext(SafeContext)

  if (!config) {
    throw new MissingSafeProviderError('`useSafe` must be used within `SafeProvider`.')
  }

  const { connect, disconnect, isSignerConnected } = useAuthenticate()

  return {
    isInitialized,
    isSignerConnected,
    connect,
    disconnect,
    getBalance: useBalance,
    getChain: useChain,
    getPendingTransactions: usePendingTransactions,
    getTransactions: useTransactions,
    getSafeInfo: useSafeInfo,
    getSignerAddress: useSignerAddress
  }
}
