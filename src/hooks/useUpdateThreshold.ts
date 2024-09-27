import {
  UseMutateAsyncFunction,
  UseMutateFunction,
  useMutation,
  UseMutationResult
} from '@tanstack/react-query'
import { SafeClientResult } from '@safe-global/sdk-starter-kit'
import { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'
import { useSignerClient } from '@/hooks/useSignerClient.js'
import { MutationKey } from '@/constants.js'
import { useSendTransaction } from './useSendTransaction.js'

type UpdateThresholdVariables = { threshold: number }

export type UseUpdateThresholdParams = ConfigParam<SafeConfigWithSigner>
export type UseUpdateThresholdReturnType = Omit<
  UseMutationResult<SafeClientResult, Error, UpdateThresholdVariables>,
  'mutate' | 'mutateAsync'
> & {
  updateThreshold: UseMutateFunction<SafeClientResult, Error, UpdateThresholdVariables, unknown>
  updateThresholdAsync: UseMutateAsyncFunction<
    SafeClientResult,
    Error,
    UpdateThresholdVariables,
    unknown
  >
}

/**
 * Hook to update the threshold of the connected Safe.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Object containing the mutation state and the function to update the threshold.
 */
export function useUpdateThreshold(
  params: UseUpdateThresholdParams = {}
): UseUpdateThresholdReturnType {
  const signerClient = useSignerClient({ config: params.config })
  const { sendTransactionAsync } = useSendTransaction({ config: params.config })

  const mutationFn = async ({ threshold }: UpdateThresholdVariables) => {
    if (!signerClient) {
      throw new Error('Signer client is not available')
    }

    if (threshold === 0) {
      throw new Error('Threshold needs to be greater than 0')
    }

    const updateThresholdTx = await signerClient.protocolKit.createChangeThresholdTx(threshold)

    return sendTransactionAsync({ transactions: [updateThresholdTx] })
  }

  const { mutate, mutateAsync, ...result } = useMutation({
    mutationFn,
    mutationKey: [MutationKey.UpdateThreshold]
  })

  return { ...result, updateThreshold: mutate, updateThresholdAsync: mutateAsync }
}
