import { useMutation, UseMutationReturnType } from 'wagmi/query'
import { UseMutateAsyncFunction, UseMutateFunction } from '@tanstack/react-query'
import { SafeClientResult } from '@safe-global/sdk-starter-kit'
import { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'
import { useSignerClient } from '@/hooks/useSignerClient.js'

type ConfirmTransactionVariables = { safeTxHash: string }

export type UseConfirmTransactionParams = ConfigParam<SafeConfigWithSigner>
export type UseConfirmTransactionReturnType = UseMutationReturnType<
  SafeClientResult,
  Error,
  ConfirmTransactionVariables
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
  const signerClient = useSignerClient({ config: params.config })

  const mutationFn = ({ safeTxHash }: ConfirmTransactionVariables) => {
    if (!signerClient) {
      throw new Error('Signer client is not available')
    }

    if (!safeTxHash.length) {
      throw new Error('`safeTxHash` parameter must not be empty')
    }

    return signerClient.confirm({ safeTxHash })
  }

  const { mutate, mutateAsync, ...result } = useMutation({
    mutationFn,
    mutationKey: ['confirmTransaction']
  })

  return { ...result, confirmTransaction: mutate, confirmTransactionAsync: mutateAsync }
}
