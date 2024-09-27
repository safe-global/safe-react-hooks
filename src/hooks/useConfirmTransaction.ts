import {
  UseMutateAsyncFunction,
  UseMutateFunction,
  useMutation,
  UseMutationResult
} from '@tanstack/react-query'
import { SafeClientResult } from '@safe-global/sdk-starter-kit'
import { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'
import { useSignerClient } from '@/hooks/useSignerClient.js'
import { useWaitForTransaction } from '@/hooks/useWaitForTransaction.js'
import { MutationKey, QueryKey } from '@/constants.js'
import { invalidateQueries } from '@/queryClient.js'

type ConfirmTransactionVariables = { safeTxHash: string }

export type UseConfirmTransactionParams = ConfigParam<SafeConfigWithSigner>
export type UseConfirmTransactionReturnType = Omit<
  UseMutationResult<SafeClientResult, Error, ConfirmTransactionVariables>,
  'mutate' | 'mutateAsync'
> & {
  confirmTransaction: UseMutateFunction<
    SafeClientResult,
    Error,
    ConfirmTransactionVariables,
    unknown
  >
  confirmTransactionAsync: UseMutateAsyncFunction<
    SafeClientResult,
    Error,
    ConfirmTransactionVariables,
    unknown
  >
}

/**
 * Hook to confirm pending multisig transactions.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object containing the mutation state and the confirm function.
 */
export function useConfirmTransaction(
  params: UseConfirmTransactionParams = {}
): UseConfirmTransactionReturnType {
  const { waitForTransactionReceipt, waitForTransactionIndexed } = useWaitForTransaction({
    config: params.config
  })

  const signerClient = useSignerClient({ config: params.config })

  const mutationFn = async ({ safeTxHash }: ConfirmTransactionVariables) => {
    if (!signerClient) {
      throw new Error('Signer client is not available')
    }

    if (!safeTxHash.length) {
      throw new Error('`safeTxHash` parameter must not be empty')
    }

    const result = await signerClient.confirm({ safeTxHash })

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
    mutationKey: [MutationKey.ConfirmTransaction]
  })

  return { ...result, confirmTransaction: mutate, confirmTransactionAsync: mutateAsync }
}
