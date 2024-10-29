import { UseMutateAsyncFunction, UseMutateFunction, UseMutationResult } from '@tanstack/react-query'
import {
  ConfirmSafeOperationProps,
  SafeClientResult,
  safeOperations
} from '@safe-global/sdk-starter-kit'
import { useConfig } from '@/hooks/useConfig.js'
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
  const [config] = useConfig({ config: params.config })

  const { mutate, mutateAsync, ...result } = useSignerClientMutation<
    SafeClientResult,
    ConfirmSafeOperationVariables
  >({
    ...params,
    mutationKey: [MutationKey.ConfirmSafeOperation],
    mutationSafeClientFn: async (signerClient, { safeOperationHash }) => {
      if (!config?.safeOperationOptions)
        throw new Error('SafeOperationOptions are not specified in SafeConfig')

      const { bundlerUrl, ...paymasterOptions } = config.safeOperationOptions
      const signerClientWithSafeOperations = await signerClient.extend(
        safeOperations({ bundlerUrl }, paymasterOptions)
      )

      const result = await signerClientWithSafeOperations.confirmSafeOperation({
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
