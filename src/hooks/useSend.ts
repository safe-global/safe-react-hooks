import { useMutation, UseMutationReturnType } from 'wagmi/query'
import { UseMutateAsyncFunction, UseMutateFunction } from '@tanstack/react-query'
import { TransactionBase } from '@safe-global/safe-core-sdk-types'
import { SafeClientResult } from '@safe-global/sdk-starter-kit'
import { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'
import { useSignerClient } from '@/hooks/useSignerClient.js'

type SendVariables = { transactions: TransactionBase[] }

export type UseSendParams = ConfigParam<SafeConfigWithSigner>
export type UseSendReturnType = UseMutationReturnType<SafeClientResult, Error, SendVariables> & {
  send: UseMutateFunction<SafeClientResult, Error, SendVariables, unknown>
  sendAsync: UseMutateAsyncFunction<SafeClientResult, Error, SendVariables, unknown>
}

/**
 * Hook to send or propose transactions.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object containing the mutation state and the send function.
 */
export function useSend(params: UseSendParams = {}): UseSendReturnType {
  const signerClient = useSignerClient({ config: params.config })

  const mutationFn = ({ transactions = [] }: SendVariables) => {
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

  return { ...result, send: mutate, sendAsync: mutateAsync }
}
