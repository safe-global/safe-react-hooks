import { useContext, useEffect, useState } from 'react'
import { createSafeClient, type SafeClient } from '@safe-global/safe-kit'
import type { ConfigParam, SafeConfig } from '@/types/index.js'
import { SafeContext } from '@/SafeProvider.js'
import { useCompareObject } from '@/hooks/helpers/useCompare.js'

export type UseSafeClientParams = ConfigParam<SafeConfig>
export type UseSafeClientReturnType = SafeClient | undefined

/**
 * Hook to get a SafeClient instance with public capabilities which do not require a signer.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns SafeClient instance or `undefined` if the SafeClient is not initialized yet.
 */
export function usePublicClient(params: UseSafeClientParams = {}): UseSafeClientReturnType {
  const { publicClient: publicClientContext } = useContext(SafeContext)
  const hasConfigChanged = useCompareObject(params.config)

  const [publicClient, setPublicClient] = useState<SafeClient>()

  useEffect(() => {
    if (params.config && hasConfigChanged) {
      createSafeClient({ ...params.config, signer: undefined }).then(setPublicClient)
    }
  }, [params.config, hasConfigChanged])

  if (params.config) {
    return publicClient
  }

  return publicClientContext
}
