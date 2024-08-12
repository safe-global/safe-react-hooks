import type { SafeConfig, SafeConfigWithSigner } from '@/types/index.js'
import { createSafeClient } from '@safe-global/safe-kit'

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
export const createPublicClient = (config: SafeConfig) =>
  createSafeClient(getPublicClientConfig(config))

/**
 * Creates a SafeClient instance with signer capabilities.
 * @param config Config object for the Safe client with mandatory `signer` property
 * @returns Safe client instance with signer capabilities
 */
export const createSignerClient = ({ signer, ...config }: SafeConfigWithSigner) =>
  createSafeClient({
    ...getPublicClientConfig({ ...config, signer: undefined }),
    signer
  })
