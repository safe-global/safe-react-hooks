import { createContext, createElement, useCallback, useEffect, useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, WagmiProvider } from 'wagmi'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { InitializeSafeProviderError } from '@/errors/InitializeSafeProviderError.js'
import type { SafeConfig } from '@/types/index.js'
import { isSafeConfigWithSigner } from '@/types/guards.js'
import { createPublicClient, createSignerClient } from '@/createClient.js'

export type SafeContextType = {
  initialized: boolean
  config: SafeConfig | undefined
  setConfig: (config: SafeConfig) => void
  setSigner: (signer: string | undefined) => Promise<void>
  publicClient: SafeClient | undefined
  signerClient: SafeClient | undefined
}

export const SafeContext = createContext<SafeContextType>({
  initialized: false,
  config: undefined,
  setConfig: () => {},
  setSigner: () => Promise.resolve(),
  publicClient: undefined,
  signerClient: undefined
})

export type SafeProviderProps = {
  config: SafeConfig
}

const queryClient = new QueryClient()

export function SafeProvider(params: React.PropsWithChildren<SafeProviderProps>) {
  const [initialized, setInitialized] = useState(false)
  const [config, setConfig] = useState(params.config)
  const [publicClient, setPublicClient] = useState<SafeClient>()
  const [signerClient, setSignerClient] = useState<SafeClient>()

  const wagmiConfig = useMemo(
    () =>
      createConfig({
        chains: [config.chain],
        transports: { [config.chain.id]: config.transport }
      }),
    [config.chain, config.transport]
  )

  useEffect(() => {
    Promise.all([
      createPublicClient(config).then(setPublicClient),
      isSafeConfigWithSigner(config) ? setSigner(config.signer) : Promise.resolve()
    ])
      .then(() => {
        setInitialized(true)
      })
      .catch((err) => {
        throw new InitializeSafeProviderError('Failed to initialize clients.', err)
      })
  }, [config])

  const setSigner = useCallback(
    async (signer: string | undefined) => {
      if (signer) {
        try {
          const newSignerClient = await createSignerClient({ ...config, signer })
          setSignerClient(newSignerClient)
        } catch (err) {
          throw new InitializeSafeProviderError('Failed to initialize signer client.', err)
        }
      } else if (signerClient) {
        setSignerClient(undefined)
      }
    },
    [config, signerClient]
  )

  if (!config.provider) {
    throw new InitializeSafeProviderError('Provider not set in config.')
  }

  const props = {
    value: { initialized, config, setConfig, setSigner, publicClient, signerClient }
  }

  return createElement(
    SafeContext.Provider,
    props,
    createElement(
      WagmiProvider,
      { config: wagmiConfig },
      createElement(QueryClientProvider, { client: queryClient }, params.children)
    )
  )
}
