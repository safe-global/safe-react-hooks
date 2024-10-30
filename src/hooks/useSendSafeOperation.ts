import { UseMutateAsyncFunction, UseMutateFunction, UseMutationResult } from '@tanstack/react-query'
import { SafeClientResult, SendSafeOperationProps } from '@safe-global/sdk-starter-kit'
import { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'
import { useSignerClientMutation } from '@/hooks/useSignerClientMutation.js'
import { MutationKey, QueryKey } from '@/constants.js'
import { invalidateQueries } from '@/queryClient.js'

export type SendSafeOperationVariables = SendSafeOperationProps

export type UseSendSafeOperationParams = ConfigParam<SafeConfigWithSigner>
export type UseSendSafeOperationReturnType = Omit<
  UseMutationResult<SafeClientResult, Error, SendSafeOperationVariables>,
  'mutate' | 'mutateAsync'
> & {
  sendSafeOperation: UseMutateFunction<SafeClientResult, Error, SendSafeOperationVariables, unknown>
  sendSafeOperationAsync: UseMutateAsyncFunction<
    SafeClientResult,
    Error,
    SendSafeOperationVariables,
    unknown
  >
}

/**
 * Hook to send or propose Safe Operations.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object containing the mutation state and the sendSafeOperation function.
 */
export function useSendSafeOperation(
  params: UseSendSafeOperationParams = {}
): UseSendSafeOperationReturnType {
  const { mutate, mutateAsync, ...result } = useSignerClientMutation<
    SafeClientResult,
    SendSafeOperationVariables
  >({
    ...params,
    mutationKey: [MutationKey.SendSafeOperation],
    mutationSafeClientFn: async (signerClient, { transactions = [], ...paymasterSendOptions }) => {
      if (!signerClient.sendSafeOperation)
        throw new Error(
          'To use Safe Operations, you need to specify the safeOperationOptions in the SafeProvider configuration.'
        )

      const result = await signerClient.sendSafeOperation({
        transactions,
        ...paymasterSendOptions
      })

      if (result.safeOperations?.userOperationHash) {
        invalidateQueries([QueryKey.SafeOperations, QueryKey.SafeInfo])
      } else if (result.safeOperations?.safeOperationHash) {
        invalidateQueries([QueryKey.PendingSafeOperations])
      }

      return result
    }
  })

  return { ...result, sendSafeOperation: mutate, sendSafeOperationAsync: mutateAsync }
}
