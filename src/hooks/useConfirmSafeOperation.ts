import { UseMutateAsyncFunction, UseMutateFunction, UseMutationResult } from '@tanstack/react-query'
import { ConfirmSafeOperationProps, SafeClientResult } from '@safe-global/sdk-starter-kit'
import { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'
import { useSignerClientMutation } from '@/hooks/useSignerClientMutation.js'
import { MutationKey, QueryKey } from '@/constants.js'
import { invalidateQueries } from '@/queryClient.js'

export type ConfirmSafeOperationVariables = ConfirmSafeOperationProps

export type UseConfirmSafeOperationParams = ConfigParam<SafeConfigWithSigner>
export type UseConfirmSafeOperationReturnType = Omit<
  UseMutationResult<SafeClientResult, Error, ConfirmSafeOperationVariables>,
  'mutate' | 'mutateAsync'
> & {
  confirmSafeOperation: UseMutateFunction<
    SafeClientResult,
    Error,
    ConfirmSafeOperationVariables,
    unknown
  >
  confirmSafeOperationAsync: UseMutateAsyncFunction<
    SafeClientResult,
    Error,
    ConfirmSafeOperationVariables,
    unknown
  >
}

/**
 * Hook to confirm pending Safe Operations.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object containing the mutation state and the confirmSafeOperation function.
 */
export function useConfirmSafeOperation(
  params: UseConfirmSafeOperationParams = {}
): UseConfirmSafeOperationReturnType {
  const { mutate, mutateAsync, ...result } = useSignerClientMutation<
    SafeClientResult,
    ConfirmSafeOperationVariables
  >({
    ...params,
    mutationKey: [MutationKey.ConfirmSafeOperation],
    mutationSafeClientFn: async (signerClient, { safeOperationHash }) => {
      if (!signerClient.confirmSafeOperation)
        throw new Error(
          'To use Safe Operations, you need to specify the safeOperationOptions in the SafeProvider configuration.'
        )

      const result = await signerClient.confirmSafeOperation({
        safeOperationHash
      })

      if (result.safeOperations?.userOperationHash) {
        invalidateQueries([QueryKey.SafeOperations, QueryKey.SafeInfo])
      } else if (result.safeOperations?.safeOperationHash) {
        invalidateQueries([QueryKey.PendingSafeOperations])
      }

      return result
    }
  })

  return { ...result, confirmSafeOperation: mutate, confirmSafeOperationAsync: mutateAsync }
}
