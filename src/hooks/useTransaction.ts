import { Hash, isHash } from 'viem'
import {
  useTransaction as useTransactionWagmi,
  UseTransactionReturnType as UseTransactionReturnTypeWagmi
} from 'wagmi'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { useSafeTransaction, UseSafeTransactionReturnType } from './useSafeTransaction.js'

export type UseTransactionParams = ConfigParam<SafeConfig> &
  ({ safeTxHash: Hash; ethereumTxHash?: never } | { safeTxHash?: never; ethereumTxHash: Hash })

export type UseTransactionReturnType<Params extends UseTransactionParams> =
  Params['safeTxHash'] extends Hash ? UseSafeTransactionReturnType : UseTransactionReturnTypeWagmi

/**
 * Hook to get the status of a specific transaction.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @param params.safeTxHash Hash of Safe transaction to be fetched.
 * @param params.ethereumTxHash Hash of Ethereum transaction to be fetched.
 * @returns Query result object containing the transaction object.
 */
export function useTransaction<Params extends UseTransactionParams>(
  params: Params
): UseTransactionReturnType<Params> {
  if (params.safeTxHash && isHash(params.safeTxHash)) {
    return useSafeTransaction(params) as UseTransactionReturnType<Params>
  }

  return useTransactionWagmi({ hash: params.ethereumTxHash }) as UseTransactionReturnType<Params>
}
