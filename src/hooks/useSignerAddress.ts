import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import { useConfig } from '@/hooks/useConfig.js'
import { useSafeClient } from '@/hooks/useSafeClient.js'
import type { ConfigParam, SafeConfig } from '@/types/index.js'

export type UseSignerAddressParams<Config extends SafeConfig = SafeConfig> = ConfigParam<Config>
export type UseSignerAddressReturnType = Address | undefined

/**
 * Hook to get the configured signer's address.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Signer address or undefined if not available.
 */
  const [config] = useConfig({ config: params.config })

  useEffect(() => {
    safeClient?.protocolKit.getSafeProvider().getSignerAddress().then(setSigner)
  }, [safeClient])

  if (!config.signer) {
    throw new Error('Signer not configured')
  }

  return signer
}
