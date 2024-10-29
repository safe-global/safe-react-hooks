import { UseMutateAsyncFunction, UseMutateFunction, UseMutationResult } from '@tanstack/react-query'
import {
  SafeClientResult,
  safeOperations,
  SendSafeOperationProps
} from '@safe-global/sdk-starter-kit'
import { useConfig } from '@/hooks/useConfig.js'
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
  const [config] = useConfig({ config: params.config })
  const { mutate, mutateAsync, ...result } = useSignerClientMutation<
    SafeClientResult,
    SendSafeOperationVariables
  >({
    ...params,
    mutationKey: [MutationKey.SendSafeOperation],
    mutationSafeClientFn: async (signerClient, { transactions = [], ...paymasterSendOptions }) => {
      if (!config?.safeOperationOptions)
        throw new Error('SafeOperationOptions are not specified in SafeConfig')

      const { bundlerUrl, ...paymasterOptions } = config.safeOperationOptions
      const signerClientWithSafeOperations = await signerClient.extend(
        safeOperations({ bundlerUrl }, paymasterOptions)
      )

      try {
        console.log('sendSafeOperation', { transactions, ...paymasterSendOptions })
        const result = await signerClientWithSafeOperations.sendSafeOperation({
          transactions,
          ...paymasterSendOptions
        })
        console.log('result', result)

        if (result.safeOperations?.userOperationHash) {
          invalidateQueries([QueryKey.SafeOperations, QueryKey.SafeInfo])
        } else if (result.safeOperations?.safeOperationHash) {
          invalidateQueries([QueryKey.PendingSafeOperations])
        }

        return result
      } catch (error) {
        console.error('error', error)
        throw new Error("Couldn't send SafeOperation")
      }
    }
  })

  return { ...result, sendSafeOperation: mutate, sendSafeOperationAsync: mutateAsync }
}
