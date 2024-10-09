import { useCallback } from 'react'
import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { useConfig } from '@/hooks/useConfig.js'
import { useSignerClient } from '@/hooks//useSignerClient.js'
import type { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'

export type UseSignerClientMutationParams<TReturnData, TParams> =
  ConfigParam<SafeConfigWithSigner> & {
    mutationSafeClientFn: (safeClient: SafeClient, params: TParams) => Promise<TReturnData>
    mutationKey: string[]
  }
export type UseSignerClientMutationReturnType<TReturnData, TParams> = UseMutationResult<
  TReturnData,
  Error,
  TParams
>

/**
 * Hook for sending a custom mutation via the SafeClient.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @param params.mutationSafeClientFn Mutation function to be called with the SafeClient.
 * @param params.mutationKey Key to identify the mutation.
 * @returns Object containing the mutation result.
 */
export function useSignerClientMutation<TReturnData, TParams>(
  params: UseSignerClientMutationParams<TReturnData, TParams>
): UseSignerClientMutationReturnType<TReturnData, TParams> {
  const { mutationSafeClientFn, mutationKey } = params

  const [config] = useConfig({ config: params.config })
  const signerClient = useSignerClient({ config: params.config })

  const mutationFn = useCallback(
    (params: TParams) => {
      if (!signerClient) {
        throw new Error('Signer client is not available')
      }

      return mutationSafeClientFn(signerClient, params)
    },
    [signerClient, mutationSafeClientFn]
  )

  return useMutation({ mutationKey: [...mutationKey, config], mutationFn })
}
