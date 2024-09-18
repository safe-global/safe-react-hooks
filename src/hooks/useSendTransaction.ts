import { useMutation, UseMutationReturnType } from 'wagmi/query'
import { UseMutateAsyncFunction, UseMutateFunction } from '@tanstack/react-query'
import { TransactionBase } from '@safe-global/safe-core-sdk-types'
import { SafeClientResult } from '@safe-global/sdk-starter-kit'
import { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'
import { useSignerClient } from '@/hooks/useSignerClient.js'
import { useWaitForTransaction } from '@/hooks/useWaitForTransaction.js'
import { MutationKey, QueryKey } from '@/constants.js'
import { invalidateQueries } from '@/queryClient.js'

type SendTransactionVariables = { transactions: TransactionBase[] }

export type UseSendTransactionParams = ConfigParam<SafeConfigWithSigner>
export type UseSendTransactionReturnType = UseMutationReturnType<
  SafeClientResult,
  Error,
  SendTransactionVariables
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
  const signerClient = useSignerClient({ config: params.config })

  const mutationFn = async ({ transactions = [] }: SendTransactionVariables) => {
    if (!signerClient) {
      throw new Error('Signer client is not available')
    }

    if (!transactions.length) {
      throw new Error('No transactions provided')
    }

    const result = await signerClient.send({ transactions })

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

  const { mutate, mutateAsync, ...result } = useMutation({
    mutationFn,
    mutationKey: [MutationKey.SendTransaction]
  })

  return { ...result, sendTransaction: mutate, sendTransactionAsync: mutateAsync }
}
