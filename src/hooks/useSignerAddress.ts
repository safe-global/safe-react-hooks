import type { Address } from 'viem'
import { ConfigParam, SafeConfigWithSigner } from '@/types/index.js'
import { useSignerClient } from '@/hooks/useSignerClient.js'
import { useAsyncMemo } from '@/hooks/helpers/useAsyncMemo.js'

export type UseSignerAddressParams = ConfigParam<SafeConfigWithSigner>
export type UseSignerAddressReturnType = Address | undefined

/**
 * Hook to get the configured signer's address.
 * @param params Parameters to customize the hook behavior.
 * @param params.config SafeConfig to use instead of the one provided by `SafeProvider`.
 * @returns Signer address or `undefined` if not available.
 */
export function useSignerAddress(params: UseSignerAddressParams = {}): UseSignerAddressReturnType {
  const signerClient = useSignerClient({ config: params.config })

  const signerAddress = useAsyncMemo(
    async () =>
      signerClient ? signerClient.protocolKit.getSafeProvider().getSignerAddress() : undefined,
    [signerClient]
  )

  return signerAddress
}
