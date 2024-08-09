import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import { ConfigParam, SafeConfig, RequiredProp } from '@/types/index.js'
import { useSignerClient } from '@/hooks/useSignerClient.js'

export type UseSignerAddressParams = ConfigParam<RequiredProp<SafeConfig, 'signer'>>
export type UseSignerAddressReturnType = Address | undefined

/**
 * Hook to get the configured signer's address.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Signer address or `undefined` if not available.
 */
export function useSignerAddress(params: UseSignerAddressParams = {}): UseSignerAddressReturnType {
  const signerClient = useSignerClient({ config: params.config })
  const [signerAddress, setSignerAddress] = useState<UseSignerAddressReturnType>()

  useEffect(() => {
    if (signerClient) {
      signerClient?.protocolKit.getSafeProvider().getSignerAddress().then(setSignerAddress)
    } else {
      setSignerAddress(undefined)
    }
  }, [signerClient])

  return signerAddress
}
