import { createSafeClient, safeOperations } from '@safe-global/sdk-starter-kit'
import type { SafeConfig, SafeConfigWithSigner } from '@/types/index.js'

const getPublicClientConfig = ({ provider, safeAddress, safeOptions }: SafeConfig) => ({
  signer: undefined,
  provider,
  ...(safeAddress ? { safeAddress } : { safeOptions })
})

/**
 * Creates a SafeClient instance with public method capabilities.
 * @param config Config object for the Safe client
 * @returns Safe client instance with public method capabilities
 */
export const createPublicClient = async (config: SafeConfig) => {
  const publicClient = await createSafeClient(getPublicClientConfig(config))

  if (config.safeOperationOptions) {
    const { bundlerUrl, ...paymasterOptions } = config.safeOperationOptions
    const publicClientWithSafeOperations = await publicClient.extend(
      safeOperations({ bundlerUrl }, paymasterOptions)
    )

    return publicClientWithSafeOperations
  }

  return publicClient
}

/**
 * Creates a SafeClient instance with signer capabilities.
 * @param config Config object for the Safe client with mandatory `signer` property
 * @returns Safe client instance with signer capabilities
 */
export const createSignerClient = async ({ signer, ...config }: SafeConfigWithSigner) => {
  const signerClient = await createSafeClient({
    ...getPublicClientConfig({ ...config, signer: undefined }),
    signer
  })

  if (config.safeOperationOptions) {
    const { bundlerUrl, ...paymasterOptions } = config.safeOperationOptions
    const publicClientWithSafeOperations = await signerClient.extend(
      safeOperations({ bundlerUrl }, paymasterOptions)
    )

    return publicClientWithSafeOperations
  }

  return signerClient
}
