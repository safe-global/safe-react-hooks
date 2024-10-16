import { UseMutateAsyncFunction, UseMutateFunction, UseMutationResult } from '@tanstack/react-query'
import { SafeTransaction, TransactionBase } from '@safe-global/types-kit'
import { SafeClientResult } from '@safe-global/sdk-starter-kit'
import { ConfigParam, isSafeTransaction, SafeConfigWithSigner } from '@/types/index.js'
import { useSignerClientMutation } from '@/hooks/useSignerClientMutation.js'
import { useWaitForTransaction } from '@/hooks/useWaitForTransaction.js'
import { MutationKey, QueryKey } from '@/constants.js'
import { invalidateQueries } from '@/queryClient.js'

type SendTransactionVariables = { transactions: (TransactionBase | SafeTransaction)[] }

export type UseSendTransactionParams = ConfigParam<SafeConfigWithSigner>
export type UseSendTransactionReturnType = Omit<
  UseMutationResult<SafeClientResult, Error, SendTransactionVariables>,
  'mutate' | 'mutateAsync'
> & {
  sendTransaction: UseMutateFunction<SafeClientResult, Error, SendTransactionVariables, unknown>
  sendTransactionAsync: UseMutateAsyncFunction<
    SafeClientResult,
    Error,
    SendTransactionVariables,
    unknown
  >
}

/**
 * Hook to send or propose a multisig transaction.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object containing the mutation state and the send function.
 */
export function useSendTransaction(
  params: UseSendTransactionParams = {}
): UseSendTransactionReturnType {
  const { waitForTransactionReceipt, waitForTransactionIndexed } = useWaitForTransaction({
    config: params.config
  })

  const { mutate, mutateAsync, ...result } = useSignerClientMutation<
    SafeClientResult,
    SendTransactionVariables
  >({
    ...params,
    mutationKey: [MutationKey.SendTransaction],
    mutationSafeClientFn: async (signerClient, { transactions = [] }) => {
      const result = await signerClient.send({
        transactions: transactions.map((tx) =>
          isSafeTransaction(tx) ? { to: tx.data.to, value: tx.data.value, data: tx.data.data } : tx
        )
      })

      if (result.transactions?.ethereumTxHash) {
        await waitForTransactionReceipt(result.transactions.ethereumTxHash)

        invalidateQueries([QueryKey.PendingTransactions, QueryKey.SafeInfo])

        await waitForTransactionIndexed(result.transactions)

        invalidateQueries([QueryKey.Transactions])
      } else if (result.transactions?.safeTxHash) {
        invalidateQueries([QueryKey.PendingTransactions])
      }

      return result
    }
  })

  return { ...result, sendTransaction: mutate, sendTransactionAsync: mutateAsync }
}
