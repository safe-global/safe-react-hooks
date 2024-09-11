import { useContext } from 'react'
import {
  useAuthenticate,
  useBalance,
  useChain,
  UseConnectSignerReturnType,
  usePendingTransactions,
  useSafeInfo,
  useSignerAddress,
  useTransaction,
  useTransactions
} from '@/hooks/index.js'
import { MissingSafeProviderError } from '@/errors/MissingSafeProviderError.js'
import { SafeContext } from '@/SafeProvider.js'

export type UseReturnType = UseConnectSignerReturnType & {
  isInitialized: boolean
  getBalance: typeof useBalance
  getChain: typeof useChain
  getPendingTransactions: typeof usePendingTransactions
  getTransaction: typeof useTransaction
  getTransactions: typeof useTransactions
  getSafeInfo: typeof useSafeInfo
  getSignerAddress: typeof useSignerAddress
}

/**
 * Top-level hook to get Safe-related information.
 * @returns Object wrapping the Safe hooks.
 */
export function useSafe(): UseReturnType {
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
    getTransaction: useTransaction,
    getTransactions: useTransactions,
    getSafeInfo: useSafeInfo,
    getSignerAddress: useSignerAddress
  }
}
