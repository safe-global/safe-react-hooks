import { useContext } from 'react'
import {
  useAuthenticate,
  useBalance,
  useChain,
  UseConnectSignerReturnType,
  usePendingSafeOperations,
  usePendingTransactions,
  useSafeInfo,
  useSafeOperation,
  useSignerAddress,
  useTransaction,
  useTransactions,
  useSafeOperations
} from '@/hooks/index.js'
import { MissingSafeProviderError } from '@/errors/MissingSafeProviderError.js'
import { SafeContext } from '@/SafeContext.js'

export type UseSafeReturnType = UseConnectSignerReturnType & {
  isInitialized: boolean
  getBalance: typeof useBalance
  getChain: typeof useChain
  getPendingTransactions: typeof usePendingTransactions
  getTransaction: typeof useTransaction
  getTransactions: typeof useTransactions
  getSafeInfo: typeof useSafeInfo
  getSignerAddress: typeof useSignerAddress
  getSafeOperation: typeof useSafeOperation
  getSafeOperations: typeof useSafeOperations
  getPendingSafeOperations: typeof usePendingSafeOperations
}

/**
 * Top-level hook to get Safe-related information.
 * @returns Object wrapping the Safe hooks.
 */
export function useSafe(): UseSafeReturnType {
  const { isInitialized, config } = useContext(SafeContext)

  if (!config) {
    throw new MissingSafeProviderError('`useSafe` must be used within `SafeProvider`.')
  }

  const { connect, disconnect, isSignerConnected, isOwnerConnected } = useAuthenticate()

  return {
    isInitialized,
    isSignerConnected,
    isOwnerConnected,
    connect,
    disconnect,
    getBalance: useBalance,
    getChain: useChain,
    getPendingTransactions: usePendingTransactions,
    getTransaction: useTransaction,
    getTransactions: useTransactions,
    getSafeInfo: useSafeInfo,
    getSignerAddress: useSignerAddress,
    getSafeOperation: useSafeOperation,
    getSafeOperations: useSafeOperations,
    getPendingSafeOperations: usePendingSafeOperations
  }
}
