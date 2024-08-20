import { useMutation, UseMutationReturnType } from 'wagmi/query'
import { UseMutateAsyncFunction, UseMutateFunction } from '@tanstack/react-query'
import { TransactionBase } from '@safe-global/safe-core-sdk-types'
import { SafeClientResult } from '@safe-global/sdk-starter-kit'
import { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'
import { useSignerClient } from '@/hooks/useSignerClient.js'

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
  const signerClient = useSignerClient({ config: params.config })

  const mutationFn = ({ transactions = [] }: SendTransactionVariables) => {
    if (!signerClient) {
      throw new Error('Signer client is not available')
    }

    if (!transactions.length) {
      throw new Error('No transactions provided')
    }

    return signerClient.send({ transactions })
  }

  const { mutate, mutateAsync, ...result } = useMutation({
    mutationFn,
    mutationKey: ['sendTransaction']
  })

  return { ...result, sendTransaction: mutate, sendTransactionAsync: mutateAsync }
}
