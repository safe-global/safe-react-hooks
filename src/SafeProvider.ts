import { createContext, createElement, useCallback, useEffect, useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, WagmiProvider } from 'wagmi'
import { SafeClient } from '@safe-global/sdk-starter-kit'
import { InitializeSafeProviderError } from '@/errors/InitializeSafeProviderError.js'
import type { SafeConfig } from '@/types/index.js'
import { isSafeConfigWithSigner } from '@/types/guards.js'
import { createPublicClient, createSignerClient } from '@/createClient.js'

export type SafeContextType = {
  isInitialized: boolean
  isConnecting: boolean
  config: SafeConfig | undefined
  setConfig: (config: SafeConfig) => void
  setSigner: (signer: string | undefined) => Promise<void>
  publicClient: SafeClient | undefined
  signerClient: SafeClient | undefined
}

export const SafeContext = createContext<SafeContextType>({
  isInitialized: false,
  isConnecting: false,
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
  const [config, setConfig] = useState(params.config)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
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
    setIsConnecting(true)
    Promise.all([
      createPublicClient(config).then(setPublicClient),
      isSafeConfigWithSigner(config) ? setSigner(config.signer) : Promise.resolve()
    ])
      .then(() => {
        setIsInitialized(true)
      })
      .catch((err) => {
        throw new InitializeSafeProviderError('Failed to initialize clients.', err)
      })
      .finally(() => {
        setIsConnecting(false)
      })
  }, [config])

  const setSigner = useCallback(
    async (signer: string | undefined) => {
      if (signer) {
        setIsConnecting(true)
        try {
          const newSignerClient = await createSignerClient({ ...config, signer })
          setSignerClient(newSignerClient)
          setIsConnecting(false)
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
    value: { isInitialized, isConnecting, config, setConfig, setSigner, publicClient, signerClient }
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
