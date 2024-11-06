import { UseMutateAsyncFunction, UseMutateFunction, UseMutationResult } from '@tanstack/react-query'
import { SafeClientResult } from '@safe-global/sdk-starter-kit'
import { ConfigParam, SafeConfigWithSigner, SafeClient } from '@/types/index.js'
import { useSignerClientMutation } from '@/hooks/useSignerClientMutation.js'
import { useDynamicSafeAction } from '../useDynamicSafeAction.js'
import { MutationKey } from '@/constants.js'

export type SwapOwnerVariables = Parameters<SafeClient['createSwapOwnerTransaction']>[0]

export type UseSwapOwnerParams = ConfigParam<SafeConfigWithSigner>
export type UseSwapOwnerReturnType = Omit<
  UseMutationResult<SafeClientResult, Error, SwapOwnerVariables>,
  'mutate' | 'mutateAsync'
> & {
  swapOwner: UseMutateFunction<SafeClientResult, Error, SwapOwnerVariables, unknown>
  swapOwnerAsync: UseMutateAsyncFunction<SafeClientResult, Error, SwapOwnerVariables, unknown>
}

/**
 * Hook to swap an owner of the connected Safe with another address.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object containing the mutation state and the function to swap an owner.
 */
export function useSwapOwner(params: UseSwapOwnerParams = {}): UseSwapOwnerReturnType {
  const { sendAsync } = useDynamicSafeAction({ config: params.config })

  const { mutate, mutateAsync, ...result } = useSignerClientMutation<
    SafeClientResult,
    SwapOwnerVariables
  >({
    ...params,
    mutationKey: [MutationKey.SwapOwner],
    mutationSafeClientFn: async (safeClient, params) => {
      const swapOwnerTx = await safeClient.createSwapOwnerTransaction(params)
      return sendAsync({ transactions: [swapOwnerTx] })
    }
  })

  return { ...result, swapOwner: mutate, swapOwnerAsync: mutateAsync }
}
