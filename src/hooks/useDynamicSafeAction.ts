import { UseMutateAsyncFunction, UseMutateFunction } from '@tanstack/react-query'
import { SafeClientResult } from '@safe-global/sdk-starter-kit'
import { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'
import {
  useSendSafeOperation,
  UseSendSafeOperationReturnType
} from '@/hooks/useSendSafeOperation.js'
import { useSendTransaction, UseSendTransactionReturnType } from '@/hooks/useSendTransaction.js'
import {
  useConfirmSafeOperation,
  UseConfirmSafeOperationReturnType
} from '@/hooks/useConfirmSafeOperation.js'
import {
  useConfirmTransaction,
  UseConfirmTransactionReturnType
} from '@/hooks/useConfirmTransaction.js'
import { useConfig } from './useConfig.js'

export type UseDynamicSafeActionParams = ConfigParam<SafeConfigWithSigner>

export type UseDynamicSafeActionReturnType = {
  send: UseMutateFunction<SafeClientResult, Error, any, unknown>
  sendAsync: UseMutateAsyncFunction<SafeClientResult, Error, any, unknown>
  confirm: UseMutateFunction<SafeClientResult, Error, any, unknown>
  confirmAsync: UseMutateAsyncFunction<SafeClientResult, Error, any, unknown>
}

/**
 * Hook to dynamically choose between Safe Operations and Transactions.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object containing the mutation state and the send and confirm functions.
 */
export function useDynamicSafeAction(
  params: UseDynamicSafeActionParams = {}
): UseDynamicSafeActionReturnType {
  const [config] = useConfig({ config: params.config })

  const isSafeOperation = !!config?.safeOperationOptions

  // Use the appropriate hooks based on the presence of safeOperations in the config
  const { sendSafeOperation, sendSafeOperationAsync }: UseSendSafeOperationReturnType =
    useSendSafeOperation(params)

  const { sendTransaction, sendTransactionAsync }: UseSendTransactionReturnType =
    useSendTransaction(params)

  const { confirmSafeOperation, confirmSafeOperationAsync }: UseConfirmSafeOperationReturnType =
    useConfirmSafeOperation(params)

  const { confirmTransaction, confirmTransactionAsync }: UseConfirmTransactionReturnType =
    useConfirmTransaction(params)

  return {
    send: isSafeOperation ? sendSafeOperation : sendTransaction,
    sendAsync: isSafeOperation ? sendSafeOperationAsync : sendTransactionAsync,
    confirm: isSafeOperation ? confirmSafeOperation : confirmTransaction,
    confirmAsync: isSafeOperation ? confirmSafeOperationAsync : confirmTransactionAsync
  }
}
