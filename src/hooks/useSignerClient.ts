import { useContext, useEffect, useState } from 'react'
import { createSafeClient, type SafeClient } from '@safe-global/safe-kit'
import type { ConfigParam, SafeConfig, RequiredProp } from '@/types/index.js'
import { SafeContext } from '@/SafeProvider.js'
import { useCompareObject } from '@/hooks/helpers/useCompare.js'

export type UseSignerClientParams = ConfigParam<RequiredProp<SafeConfig, 'signer'>>
export type UseSignerClientReturnType = SafeClient | undefined

/**
 * Hook to get a SafeClient instance with signing capabilities.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns SafeClient instance or `undefined` if the SafeClient is not initialized yet.
 */
export function useSignerClient(params: UseSignerClientParams = {}): UseSignerClientReturnType {
  const { signerClient: signerClientContext } = useContext(SafeContext)
  const [signerClient, setSignerClient] = useState<SafeClient>()

  const hasConfigChanged = useCompareObject(params.config)

  useEffect(() => {
    if (params.config && hasConfigChanged) {
      createSafeClient(params.config).then(setSignerClient)
    }
  }, [params.config, hasConfigChanged])

  if (params.config) {
    return signerClient
  }

  return signerClientContext
}
