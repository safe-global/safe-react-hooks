import { createSafeClient, safeOperations } from '@safe-global/sdk-starter-kit'
import type {
  SafeClient,
  SafeConfig,
  SafeConfigWithSigner,
  SafeOperationOptions
} from '@/types/index.js'

const extendWithSafeOperations = async (
  client: SafeClient,
  operationOptions: SafeOperationOptions
) => {
  const { bundlerUrl, ...paymasterOptions } = operationOptions
  return await client.extend(safeOperations({ bundlerUrl }, paymasterOptions))
}

const getPublicClientConfig = ({
  provider,
  safeAddress,
  txServiceUrl,
  safeOptions
}: SafeConfig) => ({
  signer: undefined,
  provider,
  txServiceUrl,
  ...(safeAddress ? { safeAddress } : { safeOptions })
})

/**
 * Creates a SafeClient instance with public method capabilities.
 * @param config Config object for the Safe client
 * @returns Safe client instance with public method capabilities
 */
export const createPublicClient = async (config: SafeConfig) => {
  const publicClient = await createSafeClient(getPublicClientConfig(config))

  return config.safeOperationOptions
    ? await extendWithSafeOperations(publicClient, config.safeOperationOptions)
    : publicClient
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

  return config.safeOperationOptions
    ? await extendWithSafeOperations(signerClient, config.safeOperationOptions)
    : signerClient
}
