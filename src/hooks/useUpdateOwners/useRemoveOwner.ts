import { UseMutateAsyncFunction, UseMutateFunction, UseMutationResult } from '@tanstack/react-query'
import { SafeClient, SafeClientResult } from '@safe-global/sdk-starter-kit'
import { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'
import { useSendTransaction } from '@/hooks/useSendTransaction.js'
import { useSignerClientMutation } from '@/hooks/useSignerClientMutation.js'
import { MutationKey } from '@/constants.js'

type RemoveOwnerVariables = Parameters<SafeClient['protocolKit']['createRemoveOwnerTx']>[0]

export type UseRemoveOwnerParams = ConfigParam<SafeConfigWithSigner>
export type UseRemoveOwnerReturnType = Omit<
  UseMutationResult<SafeClientResult, Error, RemoveOwnerVariables>,
  'mutate' | 'mutateAsync'
> & {
  removeOwner: UseMutateFunction<SafeClientResult, Error, RemoveOwnerVariables, unknown>
  removeOwnerAsync: UseMutateAsyncFunction<SafeClientResult, Error, RemoveOwnerVariables, unknown>
}

/**
 * Hook to remove an owner from the connected Safe.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object containing the mutation state and the function to remove an owner.
 */
export function useRemoveOwner(params: UseRemoveOwnerParams = {}): UseRemoveOwnerReturnType {
  const { sendTransactionAsync } = useSendTransaction({ config: params.config })

  const { mutate, mutateAsync, ...result } = useSignerClientMutation<
    SafeClientResult,
    RemoveOwnerVariables
  >({
    ...params,
    mutationKey: [MutationKey.RemoveOwner],
    mutationSafeClientFn: async (safeClient, params) => {
      const removeOwnerTx = await safeClient.protocolKit.createRemoveOwnerTx(params)
      return sendTransactionAsync({ transactions: [removeOwnerTx] })
    }
  })

  return { ...result, removeOwner: mutate, removeOwnerAsync: mutateAsync }
}