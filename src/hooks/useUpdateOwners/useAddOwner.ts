import { UseMutateAsyncFunction, UseMutateFunction, UseMutationResult } from '@tanstack/react-query'
import { SafeClientResult } from '@safe-global/sdk-starter-kit'
import { ConfigParam, SafeConfigWithSigner, SafeClient } from '@/types/index.js'
import { useSendSafeOperation } from '@/hooks/useSendSafeOperation.js'
import { useSendTransaction } from '@/hooks/useSendTransaction.js'
import { useConfig } from '@/hooks/useConfig.js'
import { useSignerClientMutation } from '@/hooks/useSignerClientMutation.js'

import { MutationKey } from '@/constants.js'

export type AddOwnerVariables = Parameters<SafeClient['createAddOwnerTransaction']>[0]

export type UseAddOwnerParams = ConfigParam<SafeConfigWithSigner>
export type UseAddOwnerReturnType = Omit<
  UseMutationResult<SafeClientResult, Error, AddOwnerVariables>,
  'mutate' | 'mutateAsync'
> & {
  addOwner: UseMutateFunction<SafeClientResult, Error, AddOwnerVariables, unknown>
  addOwnerAsync: UseMutateAsyncFunction<SafeClientResult, Error, AddOwnerVariables, unknown>
}

/**
 * Hook to add an owner to the connected Safe.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object containing the mutation state and the function to add an owner.
 */
export function useAddOwner(params: UseAddOwnerParams = {}): UseAddOwnerReturnType {
  const [config] = useConfig({ config: params.config })
  const { sendSafeOperationAsync } = useSendSafeOperation(params)
  const { sendTransactionAsync } = useSendTransaction(params)

  const { mutate, mutateAsync, ...result } = useSignerClientMutation<
    SafeClientResult,
    AddOwnerVariables
  >({
    ...params,
    mutationKey: [MutationKey.AddOwner],
    mutationSafeClientFn: async (safeClient, params) => {
      const addOwnerTx = await safeClient.createAddOwnerTransaction(params)

      const isSafeOperation = !!config.safeOperationOptions

      return isSafeOperation
        ? sendSafeOperationAsync({ transactions: [addOwnerTx] })
        : sendTransactionAsync({ transactions: [addOwnerTx] })
    }
  })

  return { ...result, addOwner: mutate, addOwnerAsync: mutateAsync }
}
